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
    hero: 'monogram' as HeroDesign,
  },

  /**
   * Shown in the browser tab / when the link is shared.
   *
   * Both lines name the OCCASION and not only the couple: a tab or a shared
   * link that reads «مینا و مبین» alone says a pair of names and nothing about
   * what is being announced.
   *
   * عقد in both — the ceremony itself, which is what happens at a quarter
   * past eleven in a سالن عقد (see `location`). NOT نامزدی, which is the
   * engagement and is a different occasion, and NOT عروسی, which is the
   * wedding party and is a third.
   *
   * Two other places still name the day, and both still call it an
   * engagement: `calendar.eventTitle`, which is what a guest is left holding
   * in their calendar, and `monogram.lead`, which is printed on the card
   * itself. If this is an عقد then both are wrong — and the card is also the
   * share image, so correcting that one means re-running `npm run og`.
   */
  meta: {
    title: 'عقد مینا و مبین',
    description: 'دعوت‌نامهٔ مراسم عقد',
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
     * stacked one does — and each takes its own conjunction: `&` in the
     * English, و in the Persian. An ampersand set in Nastaliq is a Latin mark
     * dropped into a Persian line, and it reads as one.
     */
    pair: { en: 'MINA & MOBIN', fa: 'مینا و مبین' },
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
     *
     * The hour has to agree with `timeFa` below, which is the only place a
     * guest actually reads it. It is a MORNING: 11:15, not 23:15.
     */
    iso: '2026-08-30T11:15:00+03:30',
    /** The one line beneath the names on the card. */
    cardDate: "17 Rabi'",
    /** The line under the hero, on the scroll cue. */
    dateLine: "17 Rabi'",
    /**
     * The date in Persian, set over the address in three lines: the Solar
     * Hijri date, the lunar date it falls on, and the hour. Three fields
     * rather than one string because they are set at three different sizes —
     * the day is the line that carries, and the other two attend it.
     */
    dateFa: 'یکشنبه ۸ شهریور ۱۴۰۵',
    dateHijriFa: 'مصادف با ۱۷ ربیع الاول',
    timeFa: 'ساعت ۱۱:۱۵ صبح',
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
    /** The invocation, set above the verse and apart from it. */
    bismillah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    /** Keep this as one continuous string — it is split per-word. */
    arabic:
      'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
    reference: 'سورهٔ روم — آیهٔ ۲۱',
  },

  /**
   * The blessing, in the family's own hand.
   *
   * A photograph of handwriting rather than set type — which means the words
   * live in the image and nothing here can read them. `alt` is the ONLY place
   * they exist as text, so it is the only thing a screen reader, a search
   * engine or a guest with images turned off will ever get. Replace the
   * placeholder below with the actual wording.
   */
  poem: {
    alt: 'دست‌نوشتهٔ خانواده: بسم الله الرحمن الرحیم — تبریک به مناسبت این پیوند',
    /**
     * Who signed it. Same problem as `alt` above — the name is ink in an
     * image and nothing here can read it, so this is the only place it
     * exists as text. Replace the placeholder with the actual name.
     */
    signatureAlt: 'امضای خانواده',
  },

  /**
   * The notice at the centre of the monogram card. English, like the rest of
   * the card faces — the Persian on this site all lives below the hero.
   */
  monogram: {
    /**
     * Two lines of script above the names.
     *
     * «marriage», not «engagement» and not «wedding». The day is the عقد —
     * the ceremony at which the two are married — and English has no word for
     * it that a guest would recognise, so this is the nearest true one. The
     * wedding party that may follow is عروسی and is not what this card is for.
     *
     * This line is on the share image as well as on the card. Changing it
     * means re-running `npm run og`.
     */
    lead: ['Save the date', 'for the marriage of'],
    /** Under the date. Set in wide small capitals. */
    footer: 'FORMAL INVITATION TO FOLLOW',
  },

  /** The families speaking directly to their guests. */
  invitation: {
    /**
     * The calligraphy above the words — a photograph, so its couplet lives in
     * the image. This alt is the only place it exists as text.
     */
    verseAlt: 'خوشنویسی: یک آن شد این عاشق شدن، دنیا همان یک لحظه بود',
    /** The invitation itself. */
    line: 'با افتخار از شما دعوت می‌کنیم، در هنگامهٔ جشن این وصال همراهمان باشید.',
    /** The sign-off. */
    signature: 'خانواده‌های آخوندی و یوسفی',
  },

  /** Where it happens. */
  location: {
    eyebrow: 'نشانی',
    name: 'سالن عقد مهر دریا',
    /**
     * As Google lists it for this place. Tidied of its duplicated
     * "تهران، استان تهران، تهران" prefix — check it against how the
     * families would actually write it. Leave empty to hide the line.
     */
    address: 'سعادت‌آباد، بلوار دریا، خیابان گل‌ها، نبش توحید ۳، پلاک ۱۲، طبقهٔ سوم',
    /**
     * What the embedded map searches for. NOT the display name above: Google
     * resolved the shared link from this exact string, and it is the one that
     * lands on the right pin. The families call the place سالن عقد مهر دریا;
     * Google has it listed as this. Changing it to match the display name
     * would be tidier and would move the map.
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
   * day itself, the only thing a guest wants from this page is the way there.
   * Afterwards, `passedLine`.
   *
   * The boundaries all come off `event.iso`, in the event's own timezone, so
   * moving the date moves every one of them. See components/eventPhase.ts.
   */
  countdown: {
    /**
     * The blessing under the clock, in the family's own hand. It is a
     * photograph, so the words live in the image — this alt is the only
     * place they exist as text. Replace it with the actual wording.
     */
    blessingAlt: 'دست‌نوشته: مبارک است',
    eyebrow: 'تا آن روز',
    /**
     * From midnight on the day itself.
     *
     * «امروز», not «امشب». The window this stands in opens at midnight and
     * closes at 11:15 in the morning, so every minute of it is before noon —
     * a line that says "tonight" would be wrong for the whole of it.
     */
    eyebrowToday: 'امروز',
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
    eventTitle: 'جشن عقد مینا و مبین',
    /**
     * How long the event runs, in minutes. 240 from 11:15 in the morning ends
     * it at 3:15 in the afternoon — kept at the length it had when the hour
     * was an evening one, so it is worth confirming against a morning aghd
     * rather than assuming it carried over.
     */
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
     * So: bump it by one whenever the date, the time, the length, the venue or
     * the TITLE changes. It costs nothing to bump needlessly and it costs a
     * guest the day not to bump when it mattered.
     *
     * 0 → 1: moved from 18 September, 8pm to 30 August, 11pm.
     * 1 → 2: the same day, but 11:15 in the MORNING — it was never an
     *   evening. Anyone who added the entry before this keeps 11pm without
     *   it, which is twelve hours late for a wedding.
     * 2 → 3: the entry called the day a نامزدی. It is the عقد. Nothing about
     *   when or where it happens moved, but a guest should not have the wrong
     *   occasion sitting in their calendar for the next year.
     *
     * The UID was corrected at the same time, which it could be because the
     * invitation had not been sent to anyone yet — so to every calendar in the
     * world this is now a new event and none of the count above means anything
     * to them. It is left where it is rather than reset: the number only ever
     * has to be higher than the last one, and anyone who saved the date while
     * this was being built has an entry under the old UID that will never be
     * updated by any of this. Delete that one by hand.
     */
    sequence: 3,
  },

  /** The prompt on the sealed envelope, before it is opened. */
  opening: {
    /** Still used by the OG image, though the envelope no longer shows it. */
    prompt: 'برای گشودن، لمس کنید',
    promptEn: 'TOUCH TO OPEN',
    /**
     * The cue at the foot of the hero, once the card has landed — the card
     * fills the screen and gives no sign that there is a page under it. The
     * written line goes on the first scroll and does not come back; the caret
     * under it stays for the whole descent. See components/ScrollCue.tsx.
     */
    scrollHint: 'به پایین بکشید',
  },
} as const

export type Site = typeof site
