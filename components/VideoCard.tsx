"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  title: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  category?: string;
  speaker?: string;
  scripture?: string;
  duration?: string;
};

function getVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

export default function VideoCard({
  title,
  youtubeUrl,
  thumbnailUrl,
  category,
  speaker,
  scripture,
  duration,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const videoId = getVideoId(youtubeUrl);
  const ytThumbnail = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : null;
  const thumb = thumbnailUrl || ytThumbnail;

  return (
    <div className="group bg-brown-card/70 border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-300 hover:border-gold/15 hover:shadow-card-hover">
      <div className="relative aspect-video bg-brown overflow-hidden">
        {playing && videoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            aria-label={`Play ${title}`}
          >
            {thumb ? (
              <Image
                src={thumb}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-brown-card">
                <svg className="w-12 h-12 text-gold/20" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
              </div>
            )}
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-110 transform">
                <svg className="w-6 h-6 text-brown ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-brown/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Category badge */}
            {category && (
              <span className="absolute top-3 left-3 bg-brown/80 backdrop-blur-sm text-gold text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                {category}
              </span>
            )}
          </button>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-[17px] font-bold text-cream group-hover:text-gold transition-colors duration-300 mb-1.5 leading-snug">
          {title}
        </h3>
        {speaker && (
          <p className="text-cream/40 text-[13px] mb-2">{speaker}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-cream/50 uppercase tracking-wider font-medium">
          {scripture && <span>{scripture}</span>}
          {duration && (
            <>
              {scripture && <span className="w-1 h-1 rounded-full bg-cream/20" aria-hidden="true" />}
              <span>{duration}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
