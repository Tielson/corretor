/**
 * Fachada de vídeo: mostra capa, título e descrição. O player do YouTube/Vimeo
 * só é carregado depois do clique. O link para a plataforma fica sempre visível
 * e ganha destaque se a incorporação não carregar.
 */
import { useEffect, useRef, useState } from 'react';
import type { Video } from '@/types/media';

interface Props {
  video: Video;
  cover: { src: string; width: number; height: number } | null;
}

const EMBED_TIMEOUT_MS = 9000;

export function watchUrl(v: Pick<Video, 'provider' | 'videoId'>): string {
  return v.provider === 'youtube' ? `https://www.youtube.com/watch?v=${v.videoId}` : `https://vimeo.com/${v.videoId}`;
}

export function embedUrl(v: Pick<Video, 'provider' | 'videoId'>): string {
  return v.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${v.videoId}?autoplay=1&rel=0&cc_load_policy=1&hl=pt-BR`
    : `https://player.vimeo.com/video/${v.videoId}?autoplay=1&dnt=1`;
}

export function VideoFacade({ video, cover }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const timer = useRef<number | null>(null);
  const platform = video.provider === 'youtube' ? 'YouTube' : 'Vimeo';

  useEffect(() => {
    if (state !== 'loading') return;
    timer.current = window.setTimeout(() => setState((s) => (s === 'loading' ? 'failed' : s)), EMBED_TIMEOUT_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [state]);

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-mata">
        {state === 'idle' || state === 'failed' ? (
          <>
            {cover ? (
              <img
                src={cover.src}
                width={cover.width}
                height={cover.height}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover opacity-85"
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-sm text-cal/80">Capa indisponível</div>
            )}
            {state === 'idle' ? (
              <button
                type="button"
                onClick={() => setState('loading')}
                className="on-dark absolute inset-0 flex items-center justify-center bg-gradient-to-t from-mata-900/70 via-transparent to-transparent text-cal"
                aria-label={`Reproduzir vídeo: ${video.title}`}
              >
                <span className="flex items-center gap-3 rounded-full bg-cal/95 py-2.5 pl-3 pr-5 text-[0.95rem] font-[560] text-mata shadow-lg transition-transform hover:scale-[1.03]">
                  <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                    <circle cx="12" cy="12" r="12" fill="#1e3a2b" />
                    <path d="M10 8l6 4-6 4z" fill="#fcfbf6" />
                  </svg>
                  Assistir aqui
                </span>
              </button>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-mata-900/80 p-6 text-center text-cal">
                <p className="max-w-xs text-[0.95rem]">O vídeo não carregou nesta página.</p>
                <a
                  href={watchUrl(video)}
                  target="_blank"
                  rel="noopener"
                  className="rounded-[10px] bg-cal px-4 py-2 font-[560] text-mata"
                >
                  Abrir no {platform}
                </a>
              </div>
            )}
          </>
        ) : (
          <iframe
            src={embedUrl(video)}
            title={video.title}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setState('ready')}
            className="absolute inset-0 size-full border-0"
          />
        )}
        {video.demonstrativo && (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-ipe px-2 py-0.5 text-[0.75rem] font-[600] text-mata-900">
            Vídeo demonstrativo
          </span>
        )}
      </div>
      <figcaption>
        <p className="font-[560] text-grafite">{video.title}</p>
        <p className="mt-1 text-[0.9rem] text-grafite/80">{video.description}</p>
        {video.captions && (
          <details className="mt-2 text-[0.88rem] text-grafite/80">
            <summary className="cursor-pointer text-mata">Resumo em texto</summary>
            <p className="mt-1">{video.captions}</p>
          </details>
        )}
        <a
          href={watchUrl(video)}
          target="_blank"
          rel="noopener"
          className="mt-2 inline-block text-[0.9rem] text-mata underline decoration-areia decoration-2 underline-offset-4 hover:decoration-mata"
        >
          Abrir no {platform}
        </a>
      </figcaption>
    </figure>
  );
}
