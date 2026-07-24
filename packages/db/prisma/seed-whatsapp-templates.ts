// Seed for the WhatsAppMessageTemplate table used by the shared
// <WhatsAppMessagePicker> component. Idempotent — safe to re-run; existing
// rows are left unchanged (ON CONFLICT DO NOTHING semantics via a lookup
// on the deterministic id).
//
// NOT wired into the main `pnpm db:seed` on purpose — run manually the
// first time after the migration lands:
//   pnpm --filter @acme/db exec tsx prisma/seed-whatsapp-templates.ts
// (or via a one-off `pnpm --filter @acme/db exec node -e "..."` on the VPS)

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Template = { id: string; context: 'doctor' | 'hospital'; text: string; sortOrder: number }

const TEMPLATES: Template[] = [
  // ─── Doctor context (5) ────────────────────────────────────────────────
  { id: 'wa-tpl-dr-01', context: 'doctor',   sortOrder: 10, text: "I'd like to book a consultation" },
  { id: 'wa-tpl-dr-02', context: 'doctor',   sortOrder: 20, text: "I have a question about my symptoms" },
  { id: 'wa-tpl-dr-03', context: 'doctor',   sortOrder: 30, text: "I'd like to know more about your specialization" },
  { id: 'wa-tpl-dr-04', context: 'doctor',   sortOrder: 40, text: "I'd like to reschedule my appointment" },
  { id: 'wa-tpl-dr-05', context: 'doctor',   sortOrder: 50, text: "Can you recommend a treatment for [condition]?" },

  // ─── Hospital context (5) ──────────────────────────────────────────────
  { id: 'wa-tpl-hs-01', context: 'hospital', sortOrder: 10, text: "I'm interested in a treatment package" },
  { id: 'wa-tpl-hs-02', context: 'hospital', sortOrder: 20, text: "I'd like to schedule a visit" },
  { id: 'wa-tpl-hs-03', context: 'hospital', sortOrder: 30, text: "I have a question about Panchakarma treatment" },
  { id: 'wa-tpl-hs-04', context: 'hospital', sortOrder: 40, text: "I'd like directions/location details" },
  { id: 'wa-tpl-hs-05', context: 'hospital', sortOrder: 50, text: "General inquiry" },
]

async function main() {
  let created = 0
  let skipped = 0

  for (const t of TEMPLATES) {
    const existing = await prisma.whatsAppMessageTemplate.findUnique({ where: { id: t.id } })
    if (existing) {
      skipped++
      continue
    }
    await prisma.whatsAppMessageTemplate.create({
      data: {
        id:        t.id,
        context:   t.context,
        text:      t.text,
        sortOrder: t.sortOrder,
      },
    })
    created++
  }

  console.log(`whatsapp-templates seed → created ${created}, skipped ${skipped} existing.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
