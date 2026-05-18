/**
 * SECURITY: Video ID is validated against /^[a-zA-Z0-9_-]{11}$/ to prevent
 * injection into the iframe src attribute. youtube-nocookie.com is used
 * for privacy-enhanced mode (no tracking cookies until play).
 */
type Props = { url: string; title?: string };

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export default function YouTubeEmbed({ url, title = "Sermon video" }: Props) {
  const videoId = extractVideoId(url);

  // SECURITY: validate video ID is only safe characters (alphanumeric + hyphen + underscore, 11 chars)
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return (
      <div className="my-10 p-4 bg-brown/5 rounded-2xl border border-brown/10 flex items-center gap-3">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-orange font-medium hover:text-orange-hover underline-offset-2 hover:underline transition-colors">
          Watch on YouTube &rarr;
        </a>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(61,31,10,0.15)]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
