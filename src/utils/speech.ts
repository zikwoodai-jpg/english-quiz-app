// Обгортка над браузерним Web Speech API (TTS + STT).
// Розпізнавання мовлення (SpeechRecognition) підтримується лише в Chrome/Edge —
// на інших браузерах functions gracefully деградують (isSpeechRecognitionSupported === false).

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
}

let cachedEnglishVoice: SpeechSynthesisVoice | null = null

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (cachedEnglishVoice) return cachedEnglishVoice
  const voices = window.speechSynthesis.getVoices()
  cachedEnglishVoice = voices.find((v) => v.lang.startsWith('en')) ?? null
  return cachedEnglishVoice
}

export function speak(text: string, rate = 0.95): void {
  if (!isSpeechSynthesisSupported()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = rate
  const voice = pickEnglishVoice()
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

// Голоси вантажаться асинхронно в деяких браузерах — прогріваємо кеш заздалегідь.
if (isSpeechSynthesisSupported()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedEnglishVoice = null
  }
}

export interface RecognitionResult {
  transcript: string
  confidence: number
}

/** Один раунд розпізнавання мовлення. Відхиляється, якщо STT недоступний або сталася помилка/тайм-аут. */
export function listenOnce(timeoutMs = 6000): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      reject(new Error('Розпізнавання мовлення не підтримується у цьому браузері'))
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    const timer = window.setTimeout(() => {
      recognition.stop()
      reject(new Error('Час на відповідь вийшов'))
    }, timeoutMs)

    recognition.onresult = (event: any) => {
      window.clearTimeout(timer)
      const result = event.results[0][0]
      resolve({ transcript: result.transcript, confidence: result.confidence ?? 0 })
    }

    recognition.onerror = (event: any) => {
      window.clearTimeout(timer)
      reject(new Error(event.error === 'no-speech' ? 'Не почули мовлення — спробуйте ще раз' : `Помилка розпізнавання: ${event.error}`))
    }

    recognition.onend = () => {
      window.clearTimeout(timer)
    }

    recognition.start()
  })
}
