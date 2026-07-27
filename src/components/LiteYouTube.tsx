"use client";

/* ============================================================
   LiteYouTube — click-to-load video embed. Renders a thumbnail
   button until tapped, so the How-to-do tab never eagerly loads
   an iframe.
   ============================================================ */

import { useState } from "react";

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}

export function LiteYouTube({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const id = getYouTubeId(url);
  if (!id) return null;

  if (loaded) {
    return (
      <div className="lite-yt loaded">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="lite-yt"
      onClick={() => setLoaded(true)}
      aria-label={`Play video: ${title}`}
      style={{
        backgroundImage: `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`,
      }}
    >
      <span className="lite-yt-play" aria-hidden="true">
        ▶
      </span>
    </button>
  );
}
