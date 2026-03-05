"use client"
import { ManagerStatusDataMap } from "@rahoot/common/types/game/status"
import {
  SFX_ANSWERS_MUSIC,
  SFX_RESULTS_SOUND,
} from "@rahoot/web/utils/constants"
import clsx from "clsx"
import { useEffect, useState } from "react"
import useSound from "use-sound"

type Props = {
  data: ManagerStatusDataMap["SHOW_RESPONSES"]
}

const Responses = ({
  data: { question, answers, responses, correct },
}: Props) => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [sfxResults] = useSound(SFX_RESULTS_SOUND, { volume: 0.2 })
  const [playMusic, { stop: stopMusic }] = useSound(SFX_ANSWERS_MUSIC, {
    volume: 0.2,
    onplay: () => setIsMusicPlaying(true),
    onend: () => setIsMusicPlaying(false),
  })

  useEffect(() => {
    stopMusic()
    sfxResults()
  }, [responses])

  useEffect(() => {
    if (!isMusicPlaying) playMusic()
  }, [isMusicPlaying, playMusic])

  useEffect(() => {
    stopMusic()
  }, [playMusic, stopMusic])

  // responses is Record<string, number> — e.g. { "Paris": 3, "paris": 1, "London": 1 }
  const totalVotes = Object.values(responses).reduce((a, b) => a + b, 0)
  const sortedResponses = Object.entries(responses).sort((a, b) => b[1] - a[1])

  const isCorrect = (text: string) =>
    answers.some((a) => a.trim().toLowerCase() === text.trim().toLowerCase())

  return (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div className="mx-auto inline-flex h-full w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>

        <div className="mt-4 w-full max-w-2xl px-2">
          {/* Accepted answers */}
          <p className="mb-3 text-center text-sm font-semibold tracking-widest text-white/50 uppercase">
            Accepted answers: <span className="text-white">{correct}</span>
          </p>

          {/* Player responses */}
          <div className="flex flex-col gap-2">
            {sortedResponses.length === 0 ? (
              <p className="text-center text-white/50">No answers submitted</p>
            ) : (
              sortedResponses.map(([text, count]) => {
                const correct = isCorrect(text)
                const pct = Math.round((count / totalVotes) * 100)
                return (
                  <div
                    key={text}
                    className={clsx(
                      "flex items-center justify-between rounded-lg px-4 py-3 text-lg font-bold text-white",
                      correct ? "bg-green-500" : "bg-white/20",
                    )}
                  >
                    <span>{text}</span>
                    <span className="opacity-80">
                      {count} ({pct}%)
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Responses
