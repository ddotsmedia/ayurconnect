// AI content moderation. Uses the same provider chain as AyurBot
// (Gemini → Groq → Anthropic) to classify user-submitted text into one of:
//
//   safe          | clean — let it through
//   spam          | promotional / link-bait / repetitive — block
//   abuse         | harassment / hate / personal attack — block
//   medical-fraud | dangerous medical claims, miracle cures, "cure cancer with X"
//   off-topic     | unrelated to Ayurveda / health
//
// Returns a verdict + reason. If the LLM is unavailable, defaults to 'safe'
// so we never break user submission flows when the AI is down.

import { chat } from './llm.js'

export type ModerationVerdict = 'safe' | 'spam' | 'abuse' | 'medical-fraud' | 'off-topic'

export type ModerationResult = {
  verdict: ModerationVerdict
  reason: string
  confidence: 'low' | 'medium' | 'high'
  blocked: boolean // true for non-safe verdicts
  provider?: string
}

const SYSTEM = `You are a content moderator for an Ayurveda medical platform. Classify the user-submitted text. Output STRICT JSON only — no markdown fences, no prose, exactly:

{"verdict":"safe|spam|abuse|medical-fraud|off-topic","reason":"1 short sentence","confidence":"low|medium|high"}

Rules:
- "safe": legitimate review, question, discussion, or experience.
- "spam": promotional URLs, repetitive ad copy, "buy now" / discount codes.
- "abuse": personal attacks, harassment, hate speech, sexually explicit, threats.
- "medical-fraud": dangerous claims (e.g. "100% cure for cancer", "throw away your insulin"), encouraging users to stop prescribed medication, miracle promises.
- "off-topic": unrelated to Ayurveda / health / wellness.

Default to "safe" when uncertain. Output ONLY the JSON.`

export async function moderate(text: string): Promise<ModerationResult> {
  const trimmed = (text ?? '').trim()
  if (!trimmed || trimmed.length < 5) {
    return { verdict: 'safe', reason: 'too short to classify', confidence: 'low', blocked: false }
  }

  const result = await chat({ system: SYSTEM, message: trimmed.slice(0, 4000) })
  if (!result.ok) {
    // LLM down — fail open so we don't break user submissions on outages.
    return { verdict: 'safe', reason: 'moderation service unavailable; allowing through', confidence: 'low', blocked: false }
  }

  try {
    const cleaned = result.text.trim().replace(/^```json\s*|\s*```$/g, '').replace(/^```\s*|\s*```$/g, '')
    const parsed = JSON.parse(cleaned) as { verdict?: string; reason?: string; confidence?: string }
    const verdict = ([
      'safe', 'spam', 'abuse', 'medical-fraud', 'off-topic',
    ].includes(parsed.verdict ?? '') ? parsed.verdict : 'safe') as ModerationVerdict
    return {
      verdict,
      reason: typeof parsed.reason === 'string' ? parsed.reason.slice(0, 200) : '',
      confidence: (['low', 'medium', 'high'].includes(parsed.confidence ?? '') ? parsed.confidence : 'medium') as 'low' | 'medium' | 'high',
      // Only block on high-severity. Low-confidence flags pass through to admin queue.
      blocked: verdict !== 'safe' && verdict !== 'off-topic',
      provider: result.provider,
    }
  } catch {
    return { verdict: 'safe', reason: 'invalid moderation response — allowed through', confidence: 'low', blocked: false }
  }
}
