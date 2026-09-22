import { useEffect, useRef } from 'react'
import { useAppState } from '../store/AppStateContext'
import { getDisplayName } from '../social/identity'

const LEVEL_LABEL: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

const WIDTH = 1080
const HEIGHT = 1350

function draw(ctx: CanvasRenderingContext2D, stats: { name: string; streak: number; level: string; accuracy: number; words: number; dialogues: number }) {
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  grad.addColorStop(0, '#0f0e17')
  grad.addColorStop(1, '#231d3e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.fillStyle = '#6c5ce7'
  ctx.beginPath()
  ctx.arc(WIDTH - 120, 140, 220, 0, Math.PI * 2)
  ctx.globalAlpha = 0.25
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = '#f3f1fa'
  ctx.font = '700 44px "Segoe UI", sans-serif'
  ctx.fillText('📚 QuizEnglish', 60, 120)

  ctx.font = '400 32px "Segoe UI", sans-serif'
  ctx.fillStyle = '#a9a5c0'
  ctx.fillText(stats.name, 60, 175)

  ctx.font = '800 220px "Segoe UI", sans-serif'
  ctx.fillStyle = '#00d68f'
  ctx.fillText(`🔥${stats.streak}`, 60, 480)
  ctx.font = '600 40px "Segoe UI", sans-serif'
  ctx.fillStyle = '#a9a5c0'
  ctx.fillText('днів поспіль', 66, 540)

  const cards = [
    { label: 'рівень', value: stats.level },
    { label: 'точність', value: `${stats.accuracy}%` },
    { label: 'слів вивчено', value: String(stats.words) },
    { label: 'діалогів', value: String(stats.dialogues) },
  ]

  const cardW = 460
  const cardH = 170
  const gap = 30
  const startY = 640

  cards.forEach((c, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 60 + col * (cardW + gap)
    const y = startY + row * (cardH + gap)

    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    roundRect(ctx, x, y, cardW, cardH, 24)
    ctx.fill()

    ctx.fillStyle = '#a29bfe'
    ctx.font = '800 56px "Segoe UI", sans-serif'
    ctx.fillText(c.value, x + 32, y + 90)

    ctx.fillStyle = '#a9a5c0'
    ctx.font = '600 28px "Segoe UI", sans-serif'
    ctx.fillText(c.label, x + 32, y + 135)
  })

  ctx.fillStyle = '#a9a5c0'
  ctx.font = '400 26px "Segoe UI", sans-serif'
  ctx.fillText('Вивчай англійську через quiz-стрічку — приєднуйся!', 60, HEIGHT - 60)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function ShareCard() {
  const { state } = useAppState()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const accuracy = state.totalAnswered ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0
  const stats = {
    name: getDisplayName() || 'Мій прогрес',
    streak: state.streak,
    level: state.level ? LEVEL_LABEL[state.level] : '—',
    accuracy,
    words: Object.keys(state.vocab).length,
    dialogues: state.dialoguesCompleted.length,
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    canvas.width = WIDTH
    canvas.height = HEIGHT
    draw(ctx, stats)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const toBlob = (): Promise<Blob | null> => new Promise((resolve) => canvasRef.current?.toBlob(resolve, 'image/png'))

  const handleDownload = async () => {
    const blob = await toBlob()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quizenglish-progress.png'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const blob = await toBlob()
    if (!blob) return
    const file = new File([blob], 'quizenglish-progress.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Мій прогрес у QuizEnglish' })
        return
      } catch {
        // користувач скасував — нічого не робимо
        return
      }
    }
    await handleDownload()
  }

  return (
    <div>
      <div className="card" style={{ padding: 8, marginBottom: 16, overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 14 }} />
      </div>
      <button className="primary-btn" onClick={handleShare}>
        📤 Поділитися
      </button>
      <button className="secondary-btn" onClick={handleDownload}>
        ⬇️ Завантажити PNG
      </button>
    </div>
  )
}
