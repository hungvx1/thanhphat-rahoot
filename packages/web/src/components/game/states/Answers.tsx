"use client"
import { CommonStatusDataMap } from "@rahoot/common/types/game/status"
import { useEvent, useSocket } from "@rahoot/web/contexts/socketProvider"
import { usePlayerStore } from "@rahoot/web/stores/player"
import {
  SFX_ANSWERS_MUSIC,
  SFX_ANSWERS_SOUND,
} from "@rahoot/web/utils/constants"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import useSound from "use-sound"

type Props = {
  data: CommonStatusDataMap["SELECT_ANSWER"]
}

const Answers = ({
  data: { question, image, audio, video, time, totalPlayer },
}: Props) => {
  const { gameId }: { gameId?: string } = useParams()
  const { socket } = useSocket()
  const { player } = usePlayerStore()
  const [cooldown, setCooldown] = useState(time)
  const [totalAnswer, setTotalAnswer] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [textInput, setTextInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const [sfxPop] = useSound(SFX_ANSWERS_SOUND, { volume: 0.1 })
  const [playMusic, { stop: stopMusic }] = useSound(SFX_ANSWERS_MUSIC, {
    volume: 0.2,
    interrupt: true,
    loop: true,
  })

  const handleSubmit = () => {
    if (!player || answered || !textInput.trim()) return
    setAnswered(true)
    socket?.emit("player:selectedAnswer", {
      gameId,
      data: { answerKey: textInput.trim() },
    })
    sfxPop()
  }

  useEffect(() => {
    if (video || audio) return
    playMusic()
    return () => {
      stopMusic()
    }
  }, [playMusic])

  useEffect(() => {
    if (player && inputRef.current) inputRef.current.focus()
  }, [player])

  useEvent("game:cooldown", (sec) => {
    setCooldown(sec)
  })
  useEvent("game:playerAnswer", (count) => {
    setTotalAnswer(count)
    sfxPop()
  })

  return (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div className="mx-auto inline-flex h-full w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>
        {Boolean(audio) && !player && (
          <audio
            className="m-4 mb-2 w-auto rounded-md"
            src={audio}
            autoPlay
            controls
          />
        )}
        {Boolean(video) && !player && (
          <video
            className="m-4 mb-2 aspect-video max-h-60 w-auto rounded-md px-4 sm:max-h-100"
            src={video}
            autoPlay
            controls
          />
        )}
        {Boolean(image) && (
          <img
            alt={question}
            src={image}
            className="mb-2 max-h-60 w-auto rounded-md px-4 sm:max-h-100"
          />
        )}
      </div>

      <div>
        <div className="mx-auto mb-4 flex w-full max-w-7xl justify-between px-2 text-lg font-bold text-white">
          <div className="flex flex-col items-center rounded-full bg-black/40 px-4">
            <span className="translate-y-1 text-sm">Time</span>
            <span>{cooldown}</span>
          </div>
          <div className="flex flex-col items-center rounded-full bg-black/40 px-4">
            <span className="translate-y-1 text-sm">Answers</span>
            <span>
              {totalAnswer}/{totalPlayer}
            </span>
          </div>
        </div>

        <div className="mx-auto mb-4 w-full max-w-7xl px-2">
          {!player ? (
            // Manager view — just a neutral waiting indicator
            <div className="rounded-xl bg-black/40 px-6 py-4 text-center text-lg font-semibold text-white/60">
              Players are typing…
            </div>
          ) : answered ? (
            <p className="text-center text-xl font-bold text-white">
              ✅ Answer submitted!
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type your answer…"
                maxLength={120}
                className="flex-1 rounded-xl border-2 border-white/30 bg-black/40 px-4 py-3 text-lg font-bold text-white placeholder-white/50 outline-none focus:border-white/70"
              />
              <button
                onClick={handleSubmit}
                disabled={!textInput.trim()}
                className="rounded-xl bg-white px-6 py-3 text-lg font-bold text-black transition hover:bg-white/90 disabled:opacity-40"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Answers
