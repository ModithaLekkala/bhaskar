// src/components/AudioPlayer.jsx
// -----------------------------------------------------------------------
// A persistent background music player, fixed to the bottom-right corner
// on every page. IMPORTANT: it defaults to PAUSED. Browsers block
// autoplaying audio with sound, so we never call .play() automatically —
// the user must click the button, which also satisfies autoplay policies.
//
// To use your own track: drop an mp3 file into /public (e.g.
// public/background-music.mp3) and update the `src` below to
// "/background-music.mp3".
// -----------------------------------------------------------------------
import { useRef, useState } from 'react'

export default function AudioPlayer() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  function toggle() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      // .play() returns a promise; browsers may reject it if not
      // triggered by a genuine user gesture, so we guard with .catch()
      audio.play().catch((err) => {
        console.warn('[AudioPlayer] Playback blocked by browser:', err.message)
      })
    }
    setIsPlaying((prev) => !prev)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Swap this src for your own hosted/local audio file */}
      <audio ref={audioRef} loop preload="none">
        <source src="/background-music.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={toggle}
        aria-label={isPlaying ? 'Stop background music' : 'Play background music'}
        className="w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        {isPlaying ? (
          // Stop / pause icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <rect x="6" y="5" width="4" height="14" />
            <rect x="14" y="5" width="4" height="14" />
          </svg>
        ) : (
          // Play icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  )
}
