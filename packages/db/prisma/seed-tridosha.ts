// Tridosha knowledge section — 7 article pairs (Malayalam primary +
// English companion). Each article includes classical Sanskrit shlokas
// from Ashtanga Hridayam + Charaka Samhita (public-domain texts).
// Upsert by deterministic id so re-runs are idempotent.

import type { PrismaClient } from '@prisma/client'

type Article = { id: string; title: string; content: string; category: string; language: string; source: string }

const FOOTER_EN = '\n\n---\n_Editorial content reviewed against Ashtanga Hridayam + Charaka Samhita. For personalised guidance, consult a verified BAMS / MD-Ayurveda doctor — https://ayurconnect.com/doctors. Author: AyurConnect Editorial._'
const FOOTER_ML = '\n\n---\n_അഷ്ടാംഗ ഹൃദയം + ചരക സംഹിത പ്രകാരം എഡിറ്റോറിയൽ ഉള്ളടക്കം പരിശോധിച്ചു. വ്യക്തിഗത ഉപദേശത്തിന്, https://ayurconnect.com/doctors എന്നതിലെ verified ആയുർവേദ ഡോക്ടറെ കാണുക. എഴുത്തുകാരൻ: AyurConnect Editorial._'

const ARTICLES: Article[] = [
  // ─── Article 1: Tridosha foundations ─────────────────────────────────
  { id: 'td-ml-01', language: 'ml', category: 'classical-text', source: 'Ashtanga Hridayam Sutrasthana 1.6',
    title: 'ത്രിദോഷ സിദ്ധാന്തം — ആയുർവേദത്തിന്റെ അടിസ്ഥാനം',
    content: `ആയുർവേദത്തിന്റെ പ്രവർത്തന തത്വശാസ്ത്രത്തിന്റെ കാതലാണ് ത്രിദോഷ സിദ്ധാന്തം. ശരീരത്തിലെ എല്ലാ ജൈവ പ്രവർത്തനങ്ങളെയും നിയന്ത്രിക്കുന്നത് മൂന്ന് ദോഷങ്ങളാണ് — വാത, പിത്ത, കഫ. അഷ്ടാംഗ ഹൃദയ സൂത്രസ്ഥാനത്തിലെ ക്ലാസിക്കൽ ശ്ലോകം ഇത് വ്യക്തമാക്കുന്നു:

> **वायुः पित्तं कफश्चेति त्रयो दोषाः समासतः।**
> **विकृताविकृता देहं घ्नन्ति ते वर्तयन्ति च॥**
> _(അഷ്ടാംഗ ഹൃദയം സൂത്രസ്ഥാനം 1.6)_

"വാത, പിത്ത, കഫ — ഇവ മൂന്ന് ദോഷങ്ങൾ ചുരുക്കത്തിൽ. ഇവ വികൃതമായാൽ ശരീരത്തെ നശിപ്പിക്കും; ശരിയായ അവസ്ഥയിലെങ്കിൽ ജീവനെ പരിപാലിക്കും." ദോഷങ്ങൾ കേവലം "humours" അല്ല — ജൈവ പ്രവർത്തനങ്ങളെ നിയന്ത്രിക്കുന്ന ഫങ്ഷണൽ ശക്തികളാണ്.

**എന്തുകൊണ്ട് മൂന്ന്?**
പഞ്ചമഹാഭൂതങ്ങൾ (ആകാശം, വായു, അഗ്നി, ജലം, ഭൂമി) ശരീരത്തിൽ മൂന്ന് പ്രവർത്തന കേന്ദ്രങ്ങളായി ഏകീകരിക്കുന്നു:
- **വാത** = ആകാശം + വായു → ചലനം, പ്രേരണ
- **പിത്ത** = അഗ്നി + ജലത്തിന്റെ ചെറുഭാഗം → ദഹനം, രൂപാന്തരം
- **കഫ** = ജലം + ഭൂമി → ഘടന, സ്ഥിരത, പോഷണം

**സന്തുലനാവസ്ഥ = ആരോഗ്യം**
ചരക സംഹിത (സൂത്രസ്ഥാനം 1.57) വ്യക്തമാക്കുന്നു: "സമ ദോഷഃ സമാഗ്നിശ്ച സമ ധാതു മല ക്രിയഃ — സ്വസ്ഥഃ ഇതി അഭിധീയതേ" — "ദോഷങ്ങൾ സമമായാൽ, അഗ്നി സമമായാൽ, ധാതുക്കളും മലങ്ങളും സമമായാൽ — അവനെ സ്വസ്ഥൻ (ആരോഗ്യവാൻ) എന്ന് വിളിക്കുന്നു."

**അസന്തുലനം = രോഗം**
ദോഷങ്ങൾ വർദ്ധിക്കുമ്പോൾ (വൃദ്ധി), കുറയുമ്പോൾ (ക്ഷയം), അല്ലെങ്കിൽ വൈകൃതമാകുമ്പോൾ (ദുഷ്ടി) രോഗം ഉണ്ടാകുന്നു. വാത രോഗങ്ങൾ 80, പിത്ത രോഗങ്ങൾ 40, കഫ രോഗങ്ങൾ 28 — അഷ്ടാംഗ ഹൃദയം എണ്ണിയിട്ടുണ്ട്.

**ദോഷങ്ങളുടെ കാല ചക്രം**
ദിവസത്തിലും ജീവിതത്തിലും ദോഷങ്ങൾ സ്വാഭാവികമായി ഏറ്റക്കുറച്ചിലുകൾ കാണിക്കുന്നു. പ്രഭാതം 6–10 = കഫ കാലം; ഉച്ച 10–2 = പിത്ത കാലം; വൈകുന്നേരം 2–6 = വാത കാലം. ജീവിത ഘട്ടങ്ങളിലും: ബാല്യം = കഫ പ്രബലം, യൗവനം + മധ്യവയസ്സ് = പിത്ത പ്രബലം, വാർദ്ധക്യം = വാത പ്രബലം.

**ചരിത്രം**
ചരക സംഹിത (BCE 300) ദോഷ സിദ്ധാന്തത്തിന്റെ വ്യവസ്ഥിത ചർച്ച ആരംഭിച്ചു. വാഗ്ഭടന്റെ അഷ്ടാംഗ ഹൃദയം (600 CE) അതിനെ വൈദ്യചികിത്സയിലേക്ക് സംയോജിപ്പിച്ചു. കേരളത്തിലെ സഹസ്രയോഗം + ചികിത്സാമഞ്ജരി പിന്നീട് ഇതേ ദോഷ ചട്ടക്കൂട് കേരള ചികിത്സകൾക്ക് ഉപയോഗിച്ചു.

**നിങ്ങളുടെ പ്രകൃതി കണ്ടെത്തുക**
നിങ്ങളുടെ ജന്മസിദ്ധമായ ദോഷ പ്രകൃതി മനസ്സിലാക്കിയാൽ — ദൈനംദിന ഭക്ഷണം, വ്യായാമം, ജീവിതശൈലി ഇതെല്ലാം വ്യക്തിഗതമായി ക്രമീകരിക്കാം. AyurConnect-ന്റെ പ്രകൃതി ക്വിസ് സൗജന്യമാണ്: https://ayurconnect.com/prakriti-quiz` + FOOTER_ML,
  },
  { id: 'td-en-01', language: 'en', category: 'classical-text', source: 'Ashtanga Hridayam Sutrasthana 1.6',
    title: 'Tridosha Theory — The Foundation of Ayurveda',
    content: `Tridosha theory is the central operating philosophy of Ayurveda. Every biological function in the body is governed by three doshas — Vata, Pitta, Kapha. Vagbhata's Ashtanga Hridayam (Sutrasthana 1.6) opens with the classical shloka:

> **वायुः पित्तं कफश्चेति त्रयो दोषाः समासतः।**
> **विकृताविकृता देहं घ्नन्ति ते वर्तयन्ति च॥**

"Vata, Pitta, Kapha — these are the three doshas, in brief. When vitiated, they destroy the body; when balanced, they sustain it." Doshas are not "humours" in any Hippocratic sense — they are functional forces governing biological processes.

**Why three?**
The five Mahabhutas (Akasha/Space, Vayu/Air, Agni/Fire, Apas/Water, Prithvi/Earth) consolidate in the body into three functional centres:
- **Vata** = Space + Air → movement, impulse, nerve transmission
- **Pitta** = Fire + small fraction of Water → digestion, transformation, intelligence
- **Kapha** = Water + Earth → structure, stability, lubrication, immunity

**Balance = Health**
Charaka Samhita (Sutrasthana 1.57) explicitly defines health as: "Sama-dosha sama-agnih cha sama-dhatu mala kriyaa, prasanna-atma-indriya-mana svastha iti abhidheeyate" — when doshas, Agni (digestive fire), Dhatus (tissues), and Malas (waste channels) are all in equilibrium, AND the senses + mind are settled, a person is called Svastha (healthy).

**Imbalance = Disease**
Disease arises when doshas undergo Vrddhi (excess), Kshaya (deficiency), or Dushti (vitiation). Classical Ayurveda enumerates 80 types of Vata disorders, 40 of Pitta, and 28 of Kapha — listed in Charaka Samhita Sutrasthana 20.

**The dosha clock**
Doshas fluctuate naturally through the day + lifetime:
- 6–10 AM/PM = Kapha time (heaviness, sleep tendency)
- 10–2 AM/PM = Pitta time (digestion, metabolism peak)
- 2–6 AM/PM = Vata time (mental activity, restlessness)
- Childhood = Kapha-dominant (growth, building)
- Youth + middle age = Pitta-dominant (work, transformation)
- Old age = Vata-dominant (dryness, mobility issues)

**Historical context**
Charaka Samhita (c. 300 BCE) systematised dosha theory. Sushruta Samhita extended it with surgical applications. Vagbhata's Ashtanga Hridayam (c. 600 CE) integrated both into a working medical system. Kerala's Sahasrayogam + Chikitsamanjari later applied the same dosha framework to the Kerala therapeutic tradition.

**Find your prakriti**
Understanding your inborn dosha constitution lets you personalise diet, exercise, sleep, treatment. AyurConnect's free Prakriti Quiz: https://ayurconnect.com/prakriti-quiz` + FOOTER_EN,
  },
  // ─── Article 2: Vata ─────────────────────────────────────────────────
  { id: 'td-ml-02', language: 'ml', category: 'classical-text', source: 'Ashtanga Hridayam Sutrasthana 12',
    title: 'വാത ദോഷം — ചലനത്തിന്റെയും ഊർജ്ജത്തിന്റെയും ശക്തി',
    content: `വാത ദോഷം ശരീരത്തിലെ എല്ലാ ചലന-സംവേദന പ്രവർത്തനങ്ങളെയും നിയന്ത്രിക്കുന്നു. നാഡീ പ്രേരണ, പേശി ചലനം, രക്ത ചംക്രമണം, ശ്വാസോച്ഛ്വാസം, വിസർജനം — എല്ലാം വാതത്തിന്റെ പ്രവർത്തനങ്ങളാണ്.

**പഞ്ച വാത (അഞ്ച് ഉപദോഷങ്ങൾ)**
- **പ്രാണ വാത** — തലയിലും നെഞ്ചിലും. ശ്വസനം, വിഴുങ്ങൽ, മനസ്സിന്റെ പ്രവർത്തനം, ഇന്ദ്രിയ സംവേദനം.
- **ഉദാന വാത** — കണ്ഠത്തിലും തലയിലും. സംസാരം, ശബ്ദം, ഓർമ്മ, ഉത്സാഹം.
- **സമാന വാത** — ആമാശയത്തിലും ദുരാശയത്തിലും. ദഹനത്തിലെ വാത സഹായം — അഗ്നിയോടൊപ്പം പ്രവർത്തിക്കുന്നു.
- **വ്യാന വാത** — ഹൃദയത്തിൽ നിന്ന് മുഴുശരീരത്തിലേക്കും. രക്തചംക്രമണം, പേശി ചലനം, വിയർപ്പ്, സന്ധി ചലനം.
- **അപാന വാത** — ഉദരത്തിന്റെ താഴത്തെ ഭാഗത്ത്. വിസർജനം, മൂത്രം, ആർത്തവം, പ്രസവം.

**വാത ഗുണങ്ങൾ (6)**
> **रूक्षो लघुः शीतः खरः सूक्ष्मश्चलोऽनिलः।** _(അ.ഹൃ. സൂ. 1.11)_

രൂക്ഷം (വരണ്ടത്), ലഘു (ഹൽകം), ശീത (തണുപ്പ്), ഖര (പരുപരുപ്പ്), സൂക്ഷ്മം (സൂക്ഷ്മത), ചല (ചലനം).

**വാത ശരീര പ്രകൃതി**
മെലിഞ്ഞ ശരീരം, പുറത്ത് വരണ്ട ചർമ്മം, പരുപരുപ്പുള്ള മുടി, ചെറുതും ഉണങ്ങിയതുമായ കണ്ണുകൾ, അസമമായ പല്ലുകൾ. വേഗത്തിലുള്ള ചലനങ്ങൾ, അനിയന്ത്രിതമായ വിശപ്പ്, ഉറക്കം. ചർമ്മത്തിന് ഉള്ളിലൂടെ ഞരമ്പുകൾ ദൃശ്യമാകുന്നു.

**വാത മാനസിക സ്വഭാവം**
വേഗത്തിലുള്ള ധാരണ, സർഗ്ഗാത്മകത, ഭാവനാത്മകം — പക്ഷേ വേഗത്തിലുള്ള മറവി. ഉത്കണ്ഠ, ഭയം, ചഞ്ചലത വാത വർദ്ധനവിന്റെ ലക്ഷണങ്ങൾ.

**80 വാത രോഗങ്ങൾ**
ചരക സംഹിത സൂത്രസ്ഥാനം 20-ൽ 80 വാത രോഗങ്ങൾ വിശദമായി പട്ടികപ്പെടുത്തിയിട്ടുണ്ട്. പ്രധാനപ്പെട്ടവ: ഗൃധ്രസി (സയാറ്റിക്ക), പക്ഷാഘാതം (പാരാലിസിസ്), ആമവാതം (റുമറ്റോയ്ഡ്), സന്ധി വാതം (ഓസ്റ്റിയോആർത്രൈറ്റിസ്), കടി ശൂല (നടു വേദന), അനിദ്ര (ഉറക്കമില്ലായ്മ), വിശ്രമം (ഉത്കണ്ഠ).

**വാത സന്തുലനം — ആഹാരം**
ഇഷ്ടം: ചൂട്, എണ്ണയുള്ളത്, ലവണരസം, മധുര, ആംല. അരി, ഗോതമ്പ്, പശുവിൻ പാൽ, പശു നെയ്യ്, എള്ളെണ്ണ. വാത-ശമന സുഗന്ധവ്യഞ്ജനങ്ങൾ: ജീരകം, അജ്മാൻ, അസഫോട്ടിഡ, ഇഞ്ചി.
ഒഴിവാക്കുക: വരണ്ടത് (മൊരി, ബ്രെഡ്), തണുപ്പ്, അമിത ടിക്ത, കാപ്പി, പുളിച്ച പുളിച്ച പുളിച്ച ഭക്ഷണം.

**വാത സന്തുലനം — ജീവിതശൈലി**
സ്ഥിര ദിനചര്യ — വാത ക്രമത്തെ ഇഷ്ടപ്പെടുന്നു. ദിവസവും അഭ്യംഗം (എള്ളെണ്ണ, ധന്വന്തരം തൈലം). ചൂട് കുളി. ശാന്തമായ പരിസ്ഥിതി. അമിത വ്യായാമം ഒഴിവാക്കുക. യോഗ + പ്രാണായാമം.

**വാത സന്തുലനത്തിനുള്ള കേരള ചികിത്സകൾ**
- **പിജിച്ചിൽ** — ചൂട് ഔഷധ എണ്ണ കുളി. വാത-സന്ധി രോഗങ്ങൾക്ക്.
- **നവരക്കിഴി** — അരി പിണ്ഡ സ്വേദനം. പേശി ദുർബലത + ന്യൂറോളജിക്കൽ പുനരുദ്ധാരണത്തിന്.
- **ധന്വന്തരം കഷായം** — ദൈനംദിന ആന്തരിക ഔഷധം.
- **കടി ബസ്തി** — നടു-ലുമ്പാർ വാത രോഗങ്ങൾക്ക്.

**ഔഷധികൾ**
- അശ്വഗന്ധ — അനാബോളിക്, വാത ശമനം
- ബല — പേശി-സന്ധി ശക്തി
- ദശമൂല — സമഗ്ര വാത പിന്തുണ
- തൈല-സ്നേഹനം — ദൈനംദിന ആന്തരിക + ബാഹ്യ പ്രയോഗം

പിജിച്ചിൽ + വാത-ശമന ഭക്ഷണം + ദൈനംദിന അഭ്യംഗം — കേരള ആയുർവേദത്തിന്റെ വാത-സന്തുലന ത്രയം.` + FOOTER_ML,
  },
  { id: 'td-en-02', language: 'en', category: 'classical-text', source: 'Ashtanga Hridayam Sutrasthana 12',
    title: 'Vata Dosha — The Force of Movement and Energy',
    content: `Vata dosha governs every motion-sensation function in the body — nerve impulses, muscular contraction, blood circulation, respiration, elimination. Without Vata, no biological signal moves; without Vata, no muscle contracts.

**Pancha Vata — the 5 subtypes**
- **Prana Vata** (head + chest) — respiration, swallowing, mental function, sensory perception
- **Udana Vata** (throat + head) — speech, voice, memory, enthusiasm
- **Samana Vata** (stomach + small intestine) — partners with digestive Agni; mixes digesta with juices
- **Vyana Vata** (heart radiating to whole body) — circulation, muscular movement, sweating, joint movement
- **Apana Vata** (lower abdomen) — elimination, urination, menstruation, parturition

**Vata qualities (6)**
> **रूक्षो लघुः शीतः खरः सूक्ष्मश्चलोऽनिलः।** _(Ashtanga Hridayam Sutrasthana 1.11)_

Ruksha (dry), Laghu (light), Sheeta (cold), Khara (rough), Sukshma (subtle), Chala (mobile). Anything sharing these qualities aggravates Vata; opposites pacify.

**Vata body type (Prakriti)**
Thin frame, dry skin, rough hair, small + dry eyes, irregular teeth. Quick movements but inconsistent. Variable hunger + sleep. Visible veins through the skin. Cold extremities.

**Vata mental traits**
Quick cognition, creativity, vivid imagination — but rapid forgetting. Easy enthusiasm, easy fatigue. Anxiety, fear, restlessness are early signs of Vata aggravation.

**80 Vata diseases**
Charaka Samhita Sutrasthana 20 lists 80 Vata disorders. Major ones: Gridhrasi (sciatica), Pakshaghata (hemiplegia), Aamavata (rheumatoid arthritis), Sandhi-vata (osteoarthritis), Kati-shoola (low back pain), Anidra (insomnia), generalised anxiety.

**Balancing Vata — diet**
Favour: warm, unctuous, salty, sweet, sour. Rice, wheat, cow's milk, ghee, sesame oil. Vata-pacifying spices: cumin, ajwain, asafoetida, ginger. Cooked over raw.
Avoid: dry foods (puffed grains, bread), cold, excessive bitter, coffee, excess fermented foods.

**Balancing Vata — lifestyle**
A predictable daily routine — Vata thrives on regularity. Daily Abhyanga (oil massage with sesame oil or Dhanwantaram Tailam). Warm baths. Calm environments. Avoid excessive exercise. Gentle yoga + Pranayama.

**Kerala therapies for Vata**
- **Pizhichil** — warm medicated oil bath; gold standard for Vata + joint disorders
- **Njavarakizhi** — rice bolus fomentation; for muscle wasting + neurological recovery
- **Dhanwantaram Kashayam** — daily internal Vata corrective
- **Kati Basti** — local oil retention for lumbar Vata
- **Sahacharadi Tailam** — external application for sciatica + lower-limb Vata

**Key herbs**
Ashwagandha (anabolic, Vata-pacifying), Bala (musculoskeletal strength), Dashamoola (broad-spectrum Vata support), Tila Taila (sesame — daily internal + external).

Pizhichil + Vata-pacifying diet + daily Abhyanga is the three-pillar Vata-balancing protocol of Kerala Ayurveda.` + FOOTER_EN,
  },
  // ─── Article 3: Pitta ────────────────────────────────────────────────
  { id: 'td-ml-03', language: 'ml', category: 'classical-text', source: 'Ashtanga Hridayam Sutrasthana 12',
    title: 'പിത്ത ദോഷം — ദഹനത്തിന്റെയും രൂപാന്തരത്തിന്റെയും ശക്തി',
    content: `പിത്ത ദോഷം ശരീരത്തിലെ എല്ലാ രൂപാന്തര പ്രവർത്തനങ്ങളെയും നിയന്ത്രിക്കുന്നു. ദഹനം, പോഷണത്തിന്റെ രക്തമാക്കൽ, ശരീര താപനില, കാഴ്ച, ധാരണ, ധൈര്യം — എല്ലാം പിത്തത്തിന്റെ പ്രവർത്തനങ്ങളാണ്.

**പഞ്ച പിത്ത (അഞ്ച് ഉപദോഷങ്ങൾ)**
- **പാചക പിത്തം** — ദുരാശയത്തിൽ. ദഹനത്തിന്റെ കേന്ദ്ര അഗ്നി — ജഠരാഗ്നി.
- **രഞ്ജക പിത്തം** — യകൃത്ത് + പ്ലീഹം. രക്തത്തിന് നിറം നൽകുന്നു; ഹീമോഗ്ലോബിൻ പ്രവർത്തനം.
- **സാധക പിത്തം** — ഹൃദയത്തിൽ. ധാരണ, ഓർമ്മ, ധൈര്യം, ലക്ഷ്യ പ്രാപ്തി.
- **ആലോചക പിത്തം** — കണ്ണുകളിൽ. കാഴ്ച ശക്തി, ദൃശ്യാനുഭവം.
- **ഭ്രാജക പിത്തം** — ചർമ്മത്തിൽ. ചർമ്മത്തിന്റെ നിറം + ദീപ്തി; ബാഹ്യ പ്രയോഗങ്ങളുടെ ആഗിരണം.

**പിത്ത ഗുണങ്ങൾ**
> **सस्नेहतीक्ष्णोष्णलघुविस्रं सरं द्रवं।** _(അ.ഹൃ. സൂ. 1.11)_

ഈഷത് സ്നേഹം (നേരിയ കൊഴുപ്പ്), തീക്ഷ്ണം (മൂർച്ച), ഉഷ്ണം (ചൂട്), ലഘു, വിസ്ര (പുളിച്ച ഗന്ധം), സരം (ഒഴുകുന്നത്), ദ്രവം (ദ്രവം).

**പിത്ത ശരീര പ്രകൃതി**
മധ്യമ ശരീരം, ചൂട് + ഈർപ്പമുള്ള ചർമ്മം, ചർമ്മത്തിൽ പുള്ളികളും തിലങ്ങളും, നേർത്ത മുടി (ചിലപ്പോൾ നേരത്തേ വെളുക്കും), മൃദുവായ പല്ലുകൾ, പെട്ടെന്നുള്ള വിശപ്പ്, വിയർപ്പ് ധാരാളം. ചർമ്മത്തിന് ചുവന്ന അല്ലെങ്കിൽ പിത്തളവർണ്ണം.

**പിത്ത മാനസിക സ്വഭാവം**
പ്രകടനപരം, ലക്ഷ്യ കേന്ദ്രീകൃതം, ബുദ്ധിമാൻ. ദേഷ്യം, ക്ഷമയില്ലായ്മ, വിമർശന വാസന പിത്ത വർദ്ധനവിന്റെ ലക്ഷണങ്ങൾ.

**40 പിത്ത രോഗങ്ങൾ**
പ്രധാനപ്പെട്ടവ: അമ്ലപിത്തം (ഹൈപ്പറാസിഡിറ്റി, GERD), വിസർപം (എറിസിപെലാസ്), കാമല (ജോണ്ടിസ്), രക്തപിത്തം (ബ്ലീഡിംഗ്), ദാഹം (അമിത ദാഹം), മൂത്ര ദാഹം (ഡിസൂറിയ), ജ്വരം (പിത്തജ പനി).

**പിത്ത സന്തുലനം — ആഹാരം**
ഇഷ്ടം: ശീത (തണുപ്പ്), മധുര, തിക്ത (കയ്പ്), കഷായം (ചവർപ്പ്). അരി, ഗോതമ്പ്, പശുവിൻ പാൽ, പശു നെയ്യ്, ഇളനീര്, ശീത പഴങ്ങൾ (മാമ്പഴം ഒഴികെ), ഇലക്കറികൾ, പെരുംജീരകം, ധനിയ.
ഒഴിവാക്കുക: അമിത പുളിച്ച, ഉപ്പുള്ള, ടിക്ത, എണ്ണയിൽ വറുത്തത്. ടൊമാറ്റോ, വിനാഗിരി, പുളിച്ച അച്ചാർ, അമിത കാപ്പി, മദ്യം.

**പിത്ത സന്തുലനം — ജീവിതശൈലി**
വൈകുന്നേരം ശാന്ത ജോലി. ദേഷ്യം നിയന്ത്രണം. അമിത സൂര്യപ്രകാശം ഒഴിവാക്കുക. ശീത പരിസ്ഥിതി. ചാന്ദ്രകല ധ്യാനം, ശീത ജല പ്രയോഗങ്ങൾ.

**പിത്ത സന്തുലനത്തിനുള്ള കേരള ചികിത്സകൾ**
- **ശിരോധാര** — ചൂട് ഔഷധ എണ്ണ നെറ്റിയിൽ. പിത്ത-മാനസിക സന്തുലനത്തിന്റെ സ്വർണ്ണ മാനദണ്ഡം.
- **തക്ര ധാര** — ഔഷധ മോര് ധാര. ശിരോധാരയ്ക്ക് സമാനം, പക്ഷേ കൂടുതൽ പിത്ത-ശമനം.
- **വിരേചനം പഞ്ചകർമ്മം** — കുടലിൽ നിന്ന് പിത്തം പുറത്തേക്ക്. ദീർഘകാല ത്വക് + പിത്ത രോഗങ്ങൾക്ക്.
- **അവിപത്തി ചൂർണ്ണം** — ദൈനംദിന ഹൈപ്പറാസിഡിറ്റി കരേക്റ്റീവ്.

**ഔഷധികൾ**
- ശതാവരി — ശീത, പിത്ത-ശമനം
- യഷ്ടിമധു — അമ്ലപിത്തം + ഉദര വ്രണം
- ആമലകി — ദൈനംദിന പിത്ത-ശമന ഫലം
- നീമം + ഗുഡുചി — രക്തപിത്ത ദുഷ്ടി ശുദ്ധീകരണം

ശിരോധാര + ശീത ആഹാരം + ശാന്തമായ ജീവിതശൈലി — കേരള ആയുർവേദത്തിന്റെ പിത്ത-സന്തുലന ത്രയം.` + FOOTER_ML,
  },
  { id: 'td-en-03', language: 'en', category: 'classical-text', source: 'Ashtanga Hridayam Sutrasthana 12',
    title: 'Pitta Dosha — The Force of Digestion and Transformation',
    content: `Pitta dosha governs every transformative function in the body — digestion, the rendering of nutrition into blood, body temperature regulation, vision, intellect, courage. Without Pitta, food is not digested; without Pitta, the eyes do not see colour.

**Pancha Pitta — the 5 subtypes**
- **Pachaka Pitta** (stomach + small intestine) — the central digestive fire; Jatharagni
- **Ranjaka Pitta** (liver + spleen) — gives blood its colour; haemoglobin function
- **Sadhaka Pitta** (heart) — intellect, memory, courage, goal attainment
- **Alochaka Pitta** (eyes) — visual acuity, perception of form + colour
- **Bhrajaka Pitta** (skin) — skin colour + luminosity; absorption of topical applications

**Pitta qualities**
> **सस्नेहतीक्ष्णोष्णलघुविस्रं सरं द्रवं।** _(Ashtanga Hridayam Sutrasthana 1.11)_

Slightly unctuous, sharp, hot, light, with a pungent smell, flowing, liquid. Anything sharing these qualities aggravates Pitta; opposites pacify.

**Pitta body type**
Medium frame, warm + slightly moist skin, freckles + moles common, fine hair (sometimes prematurely grey), soft teeth, sharp hunger, profuse sweating. Skin tone often warm or reddish.

**Pitta mental traits**
Goal-directed, intelligent, articulate, perfectionistic. Aggravated Pitta = anger, impatience, harsh criticism, judgmental nature.

**40 Pitta diseases**
Major: Amlapitta (hyperacidity, GERD), Visarpa (erysipelas + acute skin inflammation), Kamala (jaundice), Raktapitta (bleeding disorders), Daha (excessive thirst), Mutra-daha (dysuria), Pittaja Jwara (Pitta-type fever).

**Balancing Pitta — diet**
Favour: cool, sweet, bitter, astringent. Rice, wheat, cow's milk, ghee, coconut water, cool fruit (avoid mango in excess), leafy greens, fennel, coriander.
Avoid: excess sour, salty, pungent, deep-fried. Tomato, vinegar, sour pickles, excess coffee, alcohol.

**Balancing Pitta — lifestyle**
Calm evening work. Anger management — Pitta drives heart attacks + chronic inflammation. Avoid midday sun. Cool environments. Moonlight meditation, cool water applications.

**Kerala therapies for Pitta**
- **Sirodhara** — warm medicated oil stream on forehead; gold standard for Pitta-mental balance + insomnia
- **Takra Dhara** — medicated buttermilk stream; cooler than Sirodhara, deeper Pitta pacification
- **Virechana Panchakarma** — medicated purgation; clears Pitta from gut + blood; first-line for chronic skin + Pitta disorders
- **Avipathi Churnam** — daily hyperacidity corrective

**Key herbs**
Shatavari (cooling, Pitta-pacifying), Yastimadhu (licorice — for Amlapitta + ulcers), Amalaki (daily Pitta-pacifying fruit), Neem + Guduchi (Pitta-Rakta dushti purification).

Sirodhara + cooling diet + calm lifestyle is the three-pillar Pitta-balancing protocol of Kerala Ayurveda.` + FOOTER_EN,
  },
  // ─── Article 4: Kapha ────────────────────────────────────────────────
  { id: 'td-ml-04', language: 'ml', category: 'classical-text', source: 'Ashtanga Hridayam Sutrasthana 12',
    title: 'കഫ ദോഷം — സ്ഥിരതയുടെയും ബലത്തിന്റെയും ശക്തി',
    content: `കഫ ദോഷം ശരീരത്തിന്റെ ഘടന, സ്ഥിരത, പ്രതിരോധശേഷി, ലൂബ്രിക്കേഷൻ എന്നിവ നൽകുന്നു. ശരീരത്തിലെ എല്ലാ ജലവും കൊഴുപ്പും കഫത്തിന്റെ പ്രവർത്തനത്തിലൂടെ പരിപാലിക്കപ്പെടുന്നു.

**പഞ്ച കഫ (അഞ്ച് ഉപദോഷങ്ങൾ)**
- **ക്ലേദക കഫം** — ആമാശയത്തിൽ. ഭക്ഷണത്തെ ജലവൽകരിക്കുന്നു; ദഹനത്തിന് അനുകൂലമായ പരിസ്ഥിതി.
- **അവലംബക കഫം** — ഹൃദയ പ്രദേശത്ത്. ഹൃദയ-ശ്വാസകോശ ലൂബ്രിക്കേഷൻ; ശരീര തൂക്കം പിന്തുണ.
- **ബോധക കഫം** — കണ്ഠത്തിലും രസനയിലും. രസ ധാരണ; ഉമിനീരുമായി ബന്ധിക്കുന്നു.
- **തർപ്പക കഫം** — തലച്ചോറിൽ. കൃനിയൽ ലൂബ്രിക്കേഷൻ + പോഷണം; ഇന്ദ്രിയ പ്രവർത്തനങ്ങൾ.
- **ശ്ലേഷ്മക കഫം** — സന്ധികളിൽ. സിനോവിയൽ ദ്രവം; സന്ധി ചലനത്തിന്റെ സുഗമത.

**കഫ ഗുണങ്ങൾ**
> **स्निग्धः शीतो गुरुर्मन्दः श्लक्ष्णो मृत्स्नः स्थिरः कफः।** _(അ.ഹൃ. സൂ. 1.12)_

സ്നിഗ്ധം (എണ്ണയുള്ളത്), ശീത (തണുപ്പ്), ഗുരു (ഭാരം), മന്ദ (മൃദുവായത്), ശ്ലക്ഷ്ണ (മൃദുവായത്), മൃത്സ്ന (പശ), സ്ഥിര (സ്ഥിരത).

**കഫ ശരീര പ്രകൃതി**
ദൃഢമായ + ഇടത്തരം-വലിയ ശരീരം, എണ്ണയുള്ള + ശീത ചർമ്മം, ഇടതൂർന്ന + എണ്ണയുള്ള മുടി, വലിയ ശാന്ത കണ്ണുകൾ, വെളുത്ത + ശക്തമായ പല്ലുകൾ. പതുക്കെയുള്ള ദഹനം, ഉറക്കം നന്നായി. ശാന്തമായ വിലോലത.

**കഫ മാനസിക സ്വഭാവം**
ശാന്തം, സ്നേഹപൂർവം, ക്ഷമ. നല്ല ഓർമ്മ (പക്ഷേ പതുക്കെയുള്ള ധാരണ). കഫ വർദ്ധനവ് = മാന്ദ്യം, ലോഭം, ആലസ്യം.

**28 കഫ രോഗങ്ങൾ**
പ്രധാനപ്പെട്ടവ: സ്ഥൗല്യം (പൊണ്ണത്തടി), മധുമേഹം (ഡയബറ്റിസ്), ശ്വാസം (ആസ്ത്മ), പ്രതിശ്യായം (റൈനൈറ്റിസ്), മേദോ രോഗം (ഫാറ്റി ലിവർ), ഗളഗണ്ഡം (ഹൈപ്പോതൈറോയ്ഡിസം).

**കഫ സന്തുലനം — ആഹാരം**
ഇഷ്ടം: കടു (ഉഗ്രമായത്), തിക്ത (കയ്പ്), കഷായം (ചവർപ്പ്). ചാമ, റാഗി, ജോവർ, ബാർലി, പയറുകൾ, കയ്പുള്ള പച്ചക്കറികൾ. കഫ-ശമന സുഗന്ധവ്യഞ്ജനങ്ങൾ: ഇഞ്ചി, പിപ്പലി, മഞ്ഞൾ, കുരുമുളക്.
ഒഴിവാക്കുക: ശുദ്ധീകരിച്ച പഞ്ചസാര, വെള്ള അരി, പാൽ ഉൽപ്പന്നങ്ങൾ വൈകുന്നേരത്തിന് ശേഷം, എണ്ണയിൽ വറുത്തത്, ശീത പാനീയങ്ങൾ, ഭാരമേറിയ ഭക്ഷണം.

**കഫ സന്തുലനം — ജീവിതശൈലി**
സജീവമായ ജീവിതശൈലി, ദൈനംദിന ഉൗർജ്ജസ്വല വ്യായാമം. നേരത്തേ ഉണരുക (5–6 AM). ദിവസ ഉറക്കം ഒഴിവാക്കുക. ചൂട് + ഉണങ്ങിയ പരിസ്ഥിതി. തണുപ്പിൽ നിന്നും ഈർപ്പത്തിൽ നിന്നും രക്ഷ. ഉദ്വർത്തനം (ഔഷധ പൊടി മസാജ്).

**കഫ സന്തുലനത്തിനുള്ള കേരള ചികിത്സകൾ**
- **ഉദ്വർത്തനം** — ഔഷധ പൊടി മസാജ് (കോലകുളത്താദി ചൂർണ്ണം). കഫ-മേദ ഗതി മാറ്റുന്നു. പൊണ്ണത്തടി ചികിത്സയുടെ കേന്ദ്രം.
- **വമനം പഞ്ചകർമ്മം** — നിയന്ത്രിത ഛർദ്ദി. ദീർഘകാല ആസ്ത്മ + ദീർഘകാല ത്വക് രോഗങ്ങൾക്ക്.
- **വാരണാദി കഷായം** — ദൈനംദിന ലേഖന കഷായം.
- **ത്രികടു + ത്രിഫല** — ദൈനംദിന കഫ-മേദ-കരേക്റ്റീവ്.

**ഔഷധികൾ**
- ഗുഗ്ഗുലു — ലിപിഡ്-കുറയ്ക്കൽ
- വരണ — ഹൈപ്പോതൈറോയ്ഡ്, പൊണ്ണത്തടി
- പുനർനവ — ജല കരേക്റ്റീവ്, ഹെപ്പറ്റോപ്രൊട്ടക്ടീവ്

ഉദ്വർത്തനം + കഫ-ശമന ഭക്ഷണം + സജീവ വ്യായാമം — കേരള ആയുർവേദത്തിന്റെ കഫ-സന്തുലന ത്രയം.` + FOOTER_ML,
  },
  { id: 'td-en-04', language: 'en', category: 'classical-text', source: 'Ashtanga Hridayam Sutrasthana 12',
    title: 'Kapha Dosha — The Force of Stability and Strength',
    content: `Kapha dosha provides the body's structure, stability, immunity, lubrication. Every fluid and every fat in the body is maintained by Kapha. Without Kapha, joints do not move; without Kapha, the body has no fat reserves.

**Pancha Kapha — the 5 subtypes**
- **Kledaka Kapha** (stomach) — hydrates food; creates the environment for digestion
- **Avalambaka Kapha** (heart region) — heart + lung lubrication; supports body weight
- **Bodhaka Kapha** (throat + tongue) — taste perception; links with saliva
- **Tarpaka Kapha** (brain) — cranial lubrication + nourishment; sensory function
- **Sleshaka Kapha** (joints) — synovial fluid; smooth joint movement

**Kapha qualities**
> **स्निग्धः शीतो गुरुर्मन्दः श्लक्ष्णो मृत्स्नः स्थिरः कफः।** _(Ashtanga Hridayam Sutrasthana 1.12)_

Unctuous, cool, heavy, slow, smooth, sticky, stable. Anything sharing these qualities aggravates Kapha; opposites pacify.

**Kapha body type**
Solid + medium-large frame, oily + cool skin, thick + lustrous hair, large calm eyes, white + strong teeth. Slow digestion, sound sleep. Calm + smooth disposition.

**Kapha mental traits**
Calm, loving, patient, forgiving. Excellent long-term memory (but slow new learning). Aggravated Kapha = lethargy, attachment, greed, depressive tendency.

**28 Kapha diseases**
Major: Sthaulya (obesity), Madhumeha (diabetes), Shwasa (asthma), Pratishyaya (chronic rhinitis), Medo roga (fatty liver), Galaganda (hypothyroidism), recurrent allergic conditions.

**Balancing Kapha — diet**
Favour: pungent, bitter, astringent. Millets (ragi, jowar, bajra), barley, whole pulses, bitter vegetables. Kapha-reducing spices: ginger, long pepper (pippali), turmeric, black pepper, fenugreek.
Avoid: refined sugar, white rice, dairy after evening, deep-fried foods, cold drinks, heavy meals. Skip breakfast if not hungry — Kapha bodies don't always need it.

**Balancing Kapha — lifestyle**
Active lifestyle, daily vigorous exercise. Early waking (5–6 AM). Avoid daytime sleep — single biggest Kapha aggravator. Warm + dry environments. Protect from cold + damp. Udvarthanam (medicated powder massage) over Abhyanga.

**Kerala therapies for Kapha**
- **Udvarthanam** — medicated powder massage (Kolakulathadi Choornam); mobilises Kapha-Medas. Centrepiece of obesity therapy.
- **Vamana Panchakarma** — controlled emesis under physician supervision. Most disease-modifying for chronic asthma + chronic skin disease.
- **Varanadi Kashayam** — daily Lekhana (scraping) Kashayam
- **Trikatu + Triphala** — daily Kapha-Medas correctives

**Key herbs**
Guggulu (lipid-lowering), Varuna (hypothyroid, obesity), Punarnava (water-balance corrective, hepatoprotective), Pippali (Kapha respiratory).

Udvarthanam + Kapha-pacifying diet + active exercise is the three-pillar Kapha-balancing protocol of Kerala Ayurveda.` + FOOTER_EN,
  },
  // ─── Article 5: Prakriti ─────────────────────────────────────────────
  { id: 'td-ml-05', language: 'ml', category: 'guide', source: 'Charaka Samhita Vimanasthana 8.95',
    title: 'പ്രകൃതി — നിങ്ങളുടെ ജന്മസിദ്ധമായ ശരീര ഘടന',
    content: `പ്രകൃതി എന്നാൽ "സ്വാഭാവിക അവസ്ഥ" — ഓരോ വ്യക്തിയിലെയും ജന്മസിദ്ധമായ ദോഷ ഘടന. ഇത് ജീവിതാന്ത്യം വരെ മാറില്ല. ഇത് അറിയുന്നതാണ് വ്യക്തിഗത ആരോഗ്യ പരിപാലനത്തിന്റെ കാതൽ.

**പ്രകൃതി എങ്ങനെ നിർണ്ണയിക്കപ്പെടുന്നു?**
ഗർഭധാരണ സമയത്ത് മാതാപിതാക്കളിലെ ദോഷ അവസ്ഥ, മാതാവിന്റെ ഗർഭകാല ഭക്ഷണ-ജീവിതശൈലി, ഗർഭപാത്രത്തിലെ പരിസ്ഥിതി, ജനിച്ച സീസൺ — ഇവയെല്ലാം ചേർന്ന് ശിശുവിന്റെ പ്രകൃതി രൂപീകരിക്കുന്നു. ചരക സംഹിത വിമാനസ്ഥാനം 8.95 ഈ പ്രക്രിയ വിശദമായി വിവരിക്കുന്നു.

**ഏഴ് പ്രകൃതി തരങ്ങൾ**
- **വാത** — ശുദ്ധ വാത പ്രബലം (ഏകദേശം 7% ജനസംഖ്യ)
- **പിത്ത** — ശുദ്ധ പിത്ത പ്രബലം (≈8%)
- **കഫ** — ശുദ്ധ കഫ പ്രബലം (≈10%)
- **വാത-പിത്ത** — ഇരട്ട ദോഷം (≈20%)
- **വാത-കഫ** — ഇരട്ട ദോഷം (≈15%)
- **പിത്ത-കഫ** — ഇരട്ട ദോഷം (≈25%)
- **ത്രിദോഷ / സമ ദോഷ** — സന്തുലിത മൂന്ന് (≈15%) — അപൂർവം + ഭാഗ്യവാന്മാർ

**നിങ്ങളുടെ പ്രകൃതി കണ്ടെത്താൻ — ശാരീരിക അടയാളങ്ങൾ**
- **ശരീര ഫ്രെയിം** — വാത: മെലിഞ്ഞ; പിത്ത: മധ്യമം; കഫ: ദൃഢം
- **ചർമ്മം** — വാത: വരണ്ടത് + തണുപ്പ്; പിത്ത: ചൂട് + ഈർപ്പം; കഫ: എണ്ണയുള്ളത് + തണുപ്പ്
- **മുടി** — വാത: പരുപരുപ്പ് + വരണ്ടത്; പിത്ത: നേർത്ത + നേരത്തേ വെളുക്കും; കഫ: ഇടതൂർന്ന + എണ്ണയുള്ളത്
- **കണ്ണുകൾ** — വാത: ചെറുത് + വരണ്ടത്; പിത്ത: മൂർച്ച + പെട്ടെന്ന് ചുവക്കും; കഫ: വലുത് + ശാന്തം
- **വിശപ്പ്** — വാത: അനിയന്ത്രിതം; പിത്ത: മൂർച്ച + പെട്ടെന്നുള്ളത്; കഫ: പതുക്കെ + സ്ഥിരം
- **ഉറക്കം** — വാത: ലഘു + വിച്ഛേദിക്കപ്പെടും; പിത്ത: മധ്യമം; കഫ: ആഴമേറിയത് + ദീർഘമായത്

**മാനസിക അടയാളങ്ങൾ**
- **വാത** — സർഗ്ഗാത്മകത, വേഗത്തിലുള്ള ധാരണ + മറവി, ഉത്കണ്ഠ വർദ്ധനവിന്റെ പ്രവണത
- **പിത്ത** — ലക്ഷ്യ കേന്ദ്രീകൃതം, ബുദ്ധിമാൻ, ദേഷ്യ പ്രവണത
- **കഫ** — ശാന്തം, ദീർഘ ഓർമ്മ, മാന്ദ്യ പ്രവണത

**പെരുമാറ്റ അടയാളങ്ങൾ**
- **വാത** — ധനം പെട്ടെന്ന് സമ്പാദിക്കും + ചെലവഴിക്കും
- **പിത്ത** — ലക്ഷ്യപ്രകാരം ധനം സമ്പാദിക്കും + വ്യവസ്ഥിതമായി ചെലവഴിക്കും
- **കഫ** — പതുക്കെ സമ്പാദിക്കും + സംരക്ഷിക്കും

**പ്രകൃതി അറിയുന്നതിന്റെ പ്രാധാന്യം**
- **ഭക്ഷണം**: നിങ്ങളുടെ പ്രകൃതിക്ക് അനുയോജ്യമായ ഭക്ഷണം നിങ്ങൾക്ക് വിശുദ്ധി നൽകുന്നു; മറ്റുള്ളവർക്ക് അനുയോജ്യമായത് നിങ്ങൾക്ക് ദോഷം ചെയ്യാം.
- **വ്യായാമം**: വാത = മൃദുവായ യോഗ; പിത്ത = ശാന്തമായ നീന്തൽ; കഫ = ഉൗർജ്ജസ്വല ഏറോബിക്സ്.
- **രോഗ പ്രവണത**: പ്രകൃതി രോഗങ്ങളെ പ്രവചിക്കുന്നു — വാത = സന്ധി രോഗങ്ങൾ; പിത്ത = ദഹന-ത്വക് രോഗങ്ങൾ; കഫ = പൊണ്ണത്തടി-മധുമേഹം.
- **ചികിത്സ പ്രതികരണം**: ഒരേ ഔഷധം വ്യത്യസ്ത പ്രകൃതികളിൽ വ്യത്യസ്തമായി പ്രവർത്തിക്കാം.

**വികൃതി — നിങ്ങളുടെ നിലവിലെ അസന്തുലനം**
പ്രകൃതി മാറില്ല; വികൃതി (ഇപ്പോഴത്തെ അസന്തുലനം) മാറും. നിങ്ങൾ വാത പ്രകൃതിയാണെങ്കിലും ഇപ്പോൾ പിത്ത വർദ്ധനവുണ്ടാകാം (സ്ട്രെസ്, ചൂട് കാലാവസ്ഥ, ഭക്ഷണ പ്രശ്നം). ചികിത്സ വികൃതിയെ പിന്നോട്ടാക്കാൻ ലക്ഷ്യമിടുന്നു — പ്രകൃതിയിലേക്ക്.

**AyurConnect-ന്റെ പ്രകൃതി ക്വിസ്**
സൗജന്യം, 4 മിനിറ്റ്, 25 ചോദ്യങ്ങൾ. നിങ്ങളുടെ ദോഷ ഘടനയും വ്യക്തിഗത ശുപാർശകളും ലഭിക്കും.
🔗 https://ayurconnect.com/prakriti-quiz` + FOOTER_ML,
  },
  { id: 'td-en-05', language: 'en', category: 'guide', source: 'Charaka Samhita Vimanasthana 8.95',
    title: 'Prakriti — Your Inborn Constitution',
    content: `Prakriti means "natural state" — the inborn dosha constitution of each individual. It does not change for life. Understanding it is the foundation of personalised health care.

**How prakriti is determined**
At conception: parental dosha state, mother's prenatal diet + lifestyle, intrauterine environment, season of birth — all combine to fix the infant's prakriti. Charaka Samhita Vimanasthana 8.95 details the process exhaustively.

**Seven prakriti types**
- **Vata** — pure Vata predominance (~7% of population)
- **Pitta** — pure Pitta predominance (~8%)
- **Kapha** — pure Kapha predominance (~10%)
- **Vata-Pitta** — dual dosha (~20%)
- **Vata-Kapha** — dual dosha (~15%)
- **Pitta-Kapha** — dual dosha (~25%)
- **Tridosha / Sama-dosha** — balanced three (~15%) — rare + fortunate

**Physical signs of your prakriti**
- **Frame** — Vata: thin; Pitta: medium; Kapha: solid
- **Skin** — Vata: dry + cool; Pitta: warm + moist; Kapha: oily + cool
- **Hair** — Vata: rough + dry; Pitta: fine + early grey; Kapha: thick + lustrous
- **Eyes** — Vata: small + dry; Pitta: sharp + reddens easily; Kapha: large + calm
- **Appetite** — Vata: irregular; Pitta: sharp + sudden; Kapha: slow + steady
- **Sleep** — Vata: light + interrupted; Pitta: medium; Kapha: deep + long

**Mental signs**
- **Vata** — creative, quick understanding + quick forgetting, anxiety tendency
- **Pitta** — goal-oriented, intelligent, anger tendency
- **Kapha** — calm, long memory, depression tendency

**Behavioural signs**
- **Vata** — earns money fast, spends fast
- **Pitta** — earns by goal-direction, spends systematically
- **Kapha** — earns slowly, conserves

**Why knowing your prakriti matters**
- **Diet**: Foods that suit your prakriti nourish you; what suits others may harm you. Generic "healthy" diets fail because they don't account for prakriti.
- **Exercise**: Vata = gentle yoga; Pitta = swimming, calm activities; Kapha = vigorous aerobic.
- **Disease predisposition**: Prakriti predicts vulnerabilities — Vata: joint disorders, anxiety; Pitta: digestive + skin disorders; Kapha: obesity + diabetes.
- **Treatment response**: The same herb works differently in different prakritis. Dose and selection adjust accordingly.

**Vikriti — your current imbalance**
Prakriti doesn't change; Vikriti (current imbalance) does. You may be Vata prakriti but currently experience Pitta aggravation (from stress, hot climate, dietary mistakes). Treatment aims to reverse Vikriti — back toward Prakriti.

**Take AyurConnect's Prakriti Quiz**
Free, 4 minutes, 25 questions. Returns your dosha composition + personalised recommendations.
🔗 https://ayurconnect.com/prakriti-quiz` + FOOTER_EN,
  },
  // ─── Article 6: Ritucharya ───────────────────────────────────────────
  { id: 'td-ml-06', language: 'ml', category: 'seasonal-health', source: 'Ashtanga Hridayam Sutrasthana 3',
    title: 'ഋതുചര്യ — ദോഷങ്ങളും കാലാവസ്ഥയും',
    content: `ഋതുചര്യ — സീസൺ-അനുസരണത്തിലെ ജീവിതശൈലി. അഷ്ടാംഗ ഹൃദയ സൂത്രസ്ഥാനം 3 വിശദമായി പ്രതിപാദിക്കുന്നു. ദോഷങ്ങൾ കാലാവസ്ഥയോട് സ്വാഭാവികമായി പ്രതികരിക്കുന്നു — ഈ ഏറ്റക്കുറച്ചിലുകൾ മനസ്സിലാക്കിയാൽ രോഗം തടയാം.

**ദോഷ-ഋതു സന്തുലനം**
ദോഷങ്ങൾ ഓരോ ഋതുവിലും മൂന്ന് ഘട്ടങ്ങളിലൂടെ കടന്നുപോകുന്നു:
- **സഞ്ചയം** (ശേഖരണം) — ദോഷം ധീരേ ധീരേ വർദ്ധിക്കുന്നു
- **പ്രകോപം** (വർദ്ധനവ്) — അസ്വസ്ഥതയ്ക്കാരം ആകുന്നു
- **പ്രശമം** (ശമനം) — സ്വാഭാവികമായി കുറയുന്നു

**ആറ് ഇന്ത്യൻ ഋതുക്കൾ**
- **ശിശിര** (ജനുവരി–ഫെബ്രുവരി) — കഫ സഞ്ചയം ആരംഭം
- **വസന്ത** (മാർച്ച്–ഏപ്രിൽ) — കഫ പ്രകോപം ഉച്ചസ്ഥായം
- **ഗ്രീഷ്മ** (മേയ്–ജൂൺ) — പിത്ത സഞ്ചയം
- **വർഷ** (ജൂലൈ–ഓഗസ്റ്റ്) — വാത പ്രകോപം + ദുർബല അഗ്നി
- **ശരത്** (സെപ്റ്റംബർ–ഒക്ടോബർ) — പിത്ത പ്രകോപം ഉച്ചസ്ഥായം
- **ഹേമന്ത** (നവംബർ–ഡിസംബർ) — കഫ സഞ്ചയം ആരംഭം; ഏറ്റവും ശക്തമായ അഗ്നി

**കർക്കിടകം — കേരളത്തിന്റെ ക്ലാസിക്കൽ പുനരുദ്ധാരണ ഋതു**
വർഷ ഋതുവിൽ (മധ്യ ജൂലൈ–മധ്യ ഓഗസ്റ്റ്) വാത ദോഷം പ്രകോപിക്കും, അഗ്നി ദുർബലമാകും. എന്നാൽ ഇത് ദുരന്തമല്ല — അവസരം. ഈ കാലത്ത് മൺസൂൺ ഈർപ്പം ശരീര സുഷിരങ്ങൾ തുറക്കുകയും ഔഷധ എണ്ണകൾ ആഴത്തിലേക്ക് ആഗിരണം ചെയ്യപ്പെടുകയും ചെയ്യും. വാത-ശമന പഞ്ചകർമ്മത്തിന്റെ ഏറ്റവും ഫലപ്രദമായ കാലം. കേരളത്തിലെ കർക്കിടക ചികിത്സയുടെ വൈദ്യശാസ്ത്രീയ ന്യായം ഇതാണ്.

**ദോഷാനുസരണ സീസൺ ഭക്ഷണം**
**വാത പ്രകൃതി**: വർഷ + ശിശിര + വസന്ത = കൂടുതൽ സൂക്ഷ്മത. ചൂട്, എണ്ണയുള്ളത്, മൃദുവായത്. അജമോദ, ജീരകം, ഇഞ്ചി. അസാധാരണ ദിനചര്യ ഒഴിവാക്കുക.
**പിത്ത പ്രകൃതി**: ഗ്രീഷ്മ + ശരത് = കൂടുതൽ സൂക്ഷ്മത. ശീത, മധുര, തിക്ത. ഇളനീര്, ഉലുവ, പെരുംജീരകം. ദേഷ്യ നിയന്ത്രണം.
**കഫ പ്രകൃതി**: വസന്ത + ശിശിര = കൂടുതൽ സൂക്ഷ്മത. ലഘു, ചൂട്, കടു. ഇഞ്ചി, പിപ്പലി, മഞ്ഞൾ. പകൽ ഉറക്കം ഒഴിവാക്കുക.

**ഗൾഫ് കാലാവസ്ഥ — പ്രവാസിക്ക്**
ഇന്ത്യൻ ഋതുകൾ ഗൾഫിൽ ബാധകമല്ല — ഗൾഫ് ദ്വിമോദമാണ്:
- **ഗൾഫ് വേനൽ** (ഏപ്രിൽ–ഒക്ടോബർ) — അമിത പിത്ത + ജലനഷ്ടം. ശീത ജലം, ഇളനീര്, ശതാവരി. AC-യിൽ നിന്നുള്ള പെട്ടെന്നുള്ള താപ വ്യത്യാസം വാത വർദ്ധനവ് ഉണ്ടാക്കും.
- **ഗൾഫ് ശൈത്യം** (നവംബർ–മാർച്ച്) — വാത വർദ്ധനവ് വരണ്ടത് + AC-യിൽ നിന്ന്. ദൈനംദിന അഭ്യംഗം, ചൂട് ജലം, എണ്ണയുള്ള ഭക്ഷണം.

**AyurConnect-ന്റെ ഋതുചര്യ പ്ലാനർ**
നിങ്ങളുടെ പ്രകൃതി + ഇപ്പോഴത്തെ കാലാവസ്ഥ (ഇന്ത്യൻ / ഗൾഫ് / യൂറോപ്യൻ / അമേരിക്കൻ) അനുസരിച്ച് വ്യക്തിഗത ഋതുചര്യ ലഭിക്കും.
🔗 https://ayurconnect.com/ritucharya` + FOOTER_ML,
  },
  { id: 'td-en-06', language: 'en', category: 'seasonal-health', source: 'Ashtanga Hridayam Sutrasthana 3',
    title: 'Ritucharya — Doshas and Seasons',
    content: `Ritucharya — season-adjusted lifestyle. Ashtanga Hridayam Sutrasthana 3 details this comprehensively. Doshas respond naturally to climate; understanding these fluctuations prevents disease.

**The dosha-season cycle**
Each dosha cycles through three phases in each year:
- **Sanchaya** (accumulation) — gradual build-up
- **Prakopa** (aggravation) — peaks; symptomatic
- **Prashama** (subsidence) — natural decline

**The six Indian seasons**
- **Shishira** (Jan–Feb) — Kapha sanchaya begins
- **Vasanta** (Mar–Apr) — Kapha prakopa peaks
- **Grishma** (May–Jun) — Pitta sanchaya
- **Varsha** (Jul–Aug) — Vata prakopa + weak Agni
- **Sharad** (Sep–Oct) — Pitta prakopa peaks
- **Hemanta** (Nov–Dec) — Kapha sanchaya begins; strongest Agni

**Karkidaka — Kerala's classical rejuvenation season**
During Varsha (mid-July to mid-August), Vata aggravates + Agni weakens. But this is not catastrophe — it is opportunity. Monsoon humidity opens skin pores; medicated oils absorb deeper than at any other time. The most therapeutically potent season for Vata-pacifying Panchakarma. This is the medical rationale for Kerala's Karkidaka Chikitsa.

**Dosha-specific season diet**

**Vata prakriti**: more vulnerable in Varsha + Shishira + Vasanta.
- Favour: warm, oily, smooth. Spices: ajamoda, jiraka, ginger.
- Lifestyle: predictable routine; avoid travel + erratic schedules.

**Pitta prakriti**: more vulnerable in Grishma + Sharad.
- Favour: cool, sweet, bitter. Coconut water, fenugreek, fennel.
- Lifestyle: avoid midday sun; control anger; cool environments.

**Kapha prakriti**: more vulnerable in Vasanta + Shishira.
- Favour: light, warm, pungent. Ginger, pippali, turmeric.
- Lifestyle: vigorous exercise; absolutely no daytime sleep.

**Gulf climate — for the diaspora**
The 6-Ritu Indian calendar doesn't apply to Dubai, Abu Dhabi, Doha, Riyadh. Gulf climate is bimodal:

- **Gulf summer** (April–October) — Pitta excess + dehydration risk. Cool water, coconut water, Shatavari. AC vs. outdoor heat-swing aggravates Vata.
- **Gulf winter** (November–March) — Vata aggravation from dryness + AC. Daily Abhyanga, warm water, oily food.

European and North American climates have their own dosha-season patterns. Cold dry winters drive both Vata and Kapha. Mediterranean summers drive Pitta.

**AyurConnect's Ritucharya Planner**
Personalised regimen for your prakriti × your local climate (Indian, Gulf, European, US, Australian, SE Asian). Free.
🔗 https://ayurconnect.com/ritucharya` + FOOTER_EN,
  },
  // ─── Article 7: Kerala treatments for dosha balance ──────────────────
  { id: 'td-ml-07', language: 'ml', category: 'treatment', source: 'Sahasrayogam + Chikitsamanjari',
    title: 'ദോഷ സന്തുലനത്തിനുള്ള കേരള ചികിത്സകൾ',
    content: `കേരള ആയുർവേദ പാരമ്പര്യം ദോഷ-ശമന ചികിത്സകൾക്ക് അന്താരാഷ്ട്രീയ പ്രശസ്തിയുണ്ട്. പിജിച്ചിൽ, ശിരോധാര, ഉദ്വർത്തനം, പഞ്ചകർമ്മം — ഇവയെല്ലാം ദോഷ സന്തുലനത്തിന്റെ ക്ലാസിക്കൽ ഉപകരണങ്ങളാണ്.

**പഞ്ചകർമ്മം — അഞ്ച് ശുദ്ധീകരണ ക്രിയകൾ**
- **വമനം** (നിയന്ത്രിത ഛർദ്ദി) — കഫ-കാർമ്മ. ദീർഘകാല ആസ്ത്മ, ദീർഘകാല ത്വക് രോഗങ്ങൾ
- **വിരേചനം** (ഔഷധ വിരേചനം) — പിത്ത-കാർമ്മ. സോറിയാസിസ്, മൈഗ്രേൻ, ഫാറ്റി ലിവർ
- **ബസ്തി** (ഔഷധ എനിമ) — വാത-കാർമ്മ. ഏറ്റവും ശക്തമായത് — ആർത്രൈറ്റിസ്, നടു വേദന, വന്ധ്യത
- **നസ്യം** (മൂക്കിലൂടെ ഔഷധ തുള്ളികൾ) — ശിരോ-കാർമ്മ. സിനസൈറ്റിസ്, മുടികൊഴിച്ചിൽ, മൈഗ്രേൻ
- **രക്തമോക്ഷണം** (നിയന്ത്രിത രക്തപാത്രണം) — അപൂർവ പ്രയോഗം ഇപ്പോൾ

**ദോഷ-ചികിത്സ മാപ്പിംഗ്**

**വാത സന്തുലനത്തിന്**
- **പിജിച്ചിൽ** — ഏറ്റവും പ്രശസ്തമായ വാത ചികിത്സ. ചൂട് ഔഷധ എണ്ണ കുളി (14–21 ദിവസം).
- **നവരക്കിഴി** — അരി പിണ്ഡ സ്വേദനം. പേശി-സന്ധി പുനരുദ്ധാരണത്തിന്.
- **കടി ബസ്തി** — നടു-ലുമ്പാർ വാത വർദ്ധനവിന്റെ പ്രാദേശിക ചികിത്സ.
- **ധന്വന്തരം തൈല അഭ്യംഗം** — ദൈനംദിന ബാഹ്യ പ്രയോഗം.

**പിത്ത സന്തുലനത്തിന്**
- **ശിരോധാര** — കേരളത്തിന്റെ പ്രതീകാത്മക ചികിത്സ. ചൂട് ഔഷധ എണ്ണ നെറ്റിയിൽ. പിത്ത-മാനസിക സന്തുലനത്തിന്റെ സ്വർണ്ണ മാനദണ്ഡം.
- **തക്ര ധാര** — ഔഷധ മോര് ധാര. പിത്ത-വാത സംയോജനത്തിന്.
- **വിരേചനം പഞ്ചകർമ്മം** — ദീർഘകാല പിത്ത-രക്ത ദുഷ്ടിക്ക്.

**കഫ സന്തുലനത്തിന്**
- **ഉദ്വർത്തനം** — കോലകുളത്താദി ചൂർണ്ണം മസാജ്. പൊണ്ണത്തടി + കഫ-മേദ ദുഷ്ടി.
- **വമനം പഞ്ചകർമ്മം** — ദീർഘകാല ആസ്ത്മ + ദീർഘകാല ത്വക് രോഗങ്ങൾക്ക്.
- **രൂക്ഷ ധാര** — വരണ്ട ഔഷധ ധാര. കഫ-മേദ കരേക്റ്റീവ്.

**മിശ്ര ദോഷ ചികിത്സകൾ**
- **അഭ്യംഗം** — ദൈനംദിന എണ്ണ മസാജ്. എല്ലാ ദോഷങ്ങൾക്കും അനുയോജ്യം (എണ്ണ വ്യത്യാസപ്പെടും).
- **സ്നേഹപാനം** — ആന്തരിക ഔഷധ ഘൃതം. പഞ്ചകർമ്മ പൂർവ്വ തയ്യാറെടുപ്പ്.
- **കിഴി ചികിത്സകൾ** — പിണ്ഡ സ്വേദനങ്ങൾ. ഇലക്കിഴി (പത്ര പിണ്ഡ സ്വേദം), പൊടികിഴി, ഉഴിച്ചിൽ.

**നിങ്ങൾക്ക് യോജിച്ച കേന്ദ്രം എങ്ങനെ കണ്ടെത്താം?**
AyurConnect-ൽ verified കേരള ആയുർവേദ ആശുപത്രികളും കേന്ദ്രങ്ങളും — കേരള ടൂറിസം വർഗ്ഗീകരണം (Ayur Diamond/Gold/Silver), NABH അംഗീകാരം, AYUSH സർട്ടിഫിക്കേഷൻ പരിശോധിച്ച പട്ടിക:

- ആര്യ വൈദ്യ ശാല കോട്ടക്കൽ — 1902 മുതൽ; 27 ശാഖകൾ; NABH അംഗീകൃതം
- വൈദ്യരത്നം ഓളൂർ — കേരളത്തിന്റെ ഏറ്റവും പഴയ ആയുർവേദ സ്ഥാപനങ്ങളിൽ ഒന്ന്
- സഞ്ജീവനം എറണാകുളം — NABH; നാഡിസിസ്റ്റം + ദീർഘകാല ത്വക് + സ്പൈനൽ
- സോമതീരം കോവലം — ലോകത്തിലെ ആദ്യ ആയുർവേദ റിസോർട്ട്
- കാളരി കോവിലകം പാലക്കാട് — ലക്ഷ്വറി പുനരുദ്ധാരണം

🔗 https://ayurconnect.com/hospitals
🔗 https://ayurconnect.com/heal-in-kerala — അന്താരാഷ്ട്രീയ രോഗികൾക്കായി` + FOOTER_ML,
  },
  { id: 'td-en-07', language: 'en', category: 'treatment', source: 'Sahasrayogam + Chikitsamanjari',
    title: 'Kerala Treatments for Dosha Balance',
    content: `Kerala's Ayurveda tradition is internationally renowned for dosha-balancing therapies. Pizhichil, Sirodhara, Udvarthanam, Panchakarma — these are the classical instruments of dosha correction, refined over centuries in Kerala.

**Panchakarma — the five purification procedures**
- **Vamana** (controlled emesis) — primary Kapha-Karma. For chronic asthma + chronic skin disease.
- **Virechana** (medicated purgation) — primary Pitta-Karma. For psoriasis, migraine, fatty liver.
- **Basti** (medicated enema) — primary Vata-Karma. Considered the most powerful Panchakarma. For arthritis, back pain, infertility.
- **Nasya** (medicated nasal drops) — for head + neck region. Sinusitis, hair fall, migraine.
- **Raktamokshana** (controlled bloodletting) — rarely performed now; specific indications.

**Dosha-treatment mapping**

**For Vata balance**
- **Pizhichil** — the most famous Vata therapy. Warm medicated oil bath, 14–21 days. Gold standard for rheumatoid arthritis, osteoarthritis, neurological recovery.
- **Njavarakizhi** — rice bolus fomentation. For muscle wasting + neurological rehab.
- **Kati Basti** — local oil retention for lumbar Vata.
- **Dhanwantaram Tailam Abhyanga** — daily external Vata corrective.

**For Pitta balance**
- **Sirodhara** — Kerala's iconic therapy. Warm medicated oil stream on forehead. Gold standard for Pitta-mental balance, insomnia, anxiety, migraine.
- **Takra Dhara** — medicated buttermilk stream. Cooler than Sirodhara; deeper Pitta pacification.
- **Virechana Panchakarma** — for chronic Pitta-Rakta dushti — psoriasis, chronic eczema, fatty liver.

**For Kapha balance**
- **Udvarthanam** — Kolakulathadi Choornam medicated powder massage. Centrepiece of obesity therapy + Kapha-Medas correction.
- **Vamana Panchakarma** — for chronic asthma + chronic skin disease. Most disease-modifying Kapha intervention.
- **Ruksha Dhara** — dry medicated stream for Kapha-Medas.

**Tridosha + general therapies**
- **Abhyanga** — daily oil massage. Suits all doshas (oil selection varies).
- **Snehapana** — internal medicated ghee. Pre-Panchakarma preparation.
- **Kizhi therapies** — bolus fomentations. Patrapinda Sweda (leaf bolus), Choornapinda Sweda (powder bolus), oil-bolus variations.

**How to find the right Kerala centre**
AyurConnect surfaces verified Kerala Ayurveda hospitals + centres, cross-checked against Kerala Tourism classification (Ayur Diamond/Gold/Silver), NABH accreditation, AYUSH certification:

- **Arya Vaidya Sala Kottakkal** — est. 1902; 27 branches across India; NABH accredited; CHARITABLE trust
- **Vaidyaratnam Ollur** — among Kerala's oldest Ayurveda institutions; particularly for paralysis + neurology
- **Sanjeevanam Ernakulam** — NABH; neurology + chronic skin + spinal disorders
- **Somatheeram Kovalam** — world's first Ayurveda resort
- **Kalari Kovilakom Palakkad** — luxury palace retreat
- **Sitaram Beach Retreat Thrissur** — 4th-generation healer family

🔗 https://ayurconnect.com/hospitals
🔗 https://ayurconnect.com/heal-in-kerala — international patient guide with visa + cost data for 15 countries` + FOOTER_EN,
  },
]

export async function seedTridosha(prisma: PrismaClient): Promise<{ count: number }> {
  for (const a of ARTICLES) {
    const { id, ...data } = a
    await prisma.knowledgeArticle.upsert({ where: { id }, update: data, create: { id, ...data } })
  }
  return { count: ARTICLES.length }
}
