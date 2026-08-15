import type { NextConfig } from "next";

/**
 * A year, in seconds. Every cache lifetime below is this or derived from it.
 */
const A_YEAR = 31_536_000

const nextConfig: NextConfig = {
  // Phosphor is a barrel over ~9,000 icon modules. Without this, importing
  // two icons pulls the entire set into the compile.
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },

  images: {
    /* How long an optimised image may be kept.

       Next's own default is four hours, which is written for a site whose
       pictures change. Nothing under /public here does: the artwork is
       finished, and when a piece of it IS redrawn the file is renamed rather
       than replaced — garden-relief-v2, blessing-signature-v4, mobarak-v3.
       That convention is what makes a year safe, and it is the only thing
       that does. Overwrite a file in place and every guest who has already
       opened the invitation keeps the old one until the wedding is long past.

       Note that this is a floor, not the final word: the optimiser takes
       whichever is longer, this or the `Cache-Control` on the source file —
       and `headers()` below puts a year on those too. */
    minimumCacheTTL: A_YEAR,
  },

  /**
   * Everything in /public is served with `public, max-age=0` unless told
   * otherwise, which means a returning guest re-validates every photograph,
   * every mask and both audio files before the page can be drawn — ten or so
   * round trips on a phone, and this invitation is opened on Iranian and
   * Omani mobile data where a round trip is not cheap.
   *
   * One path segment, and an explicit list of extensions: that is exactly the
   * set of files in /public, and it deliberately cannot reach into
   * /_next/static, which Next already stamps `immutable` off a content hash.
   *
   * `immutable` rests on the same rename-don't-replace convention the image
   * cache above rests on. See the note there.
   */
  async headers() {
    return [
      {
        source: '/:asset([^/]+\\.(?:webp|png|jpe?g|svg|mp3))',
        headers: [{ key: 'Cache-Control', value: `public, max-age=${A_YEAR}, immutable` }],
      },
    ]
  },
};

export default nextConfig;
