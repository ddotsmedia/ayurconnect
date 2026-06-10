// Articles 16-25 — home remedies + specialized Kerala practices. Part B
// of the v3 batch (split for output budget). Same upsert semantics.

import type { PrismaClient } from '@prisma/client'

const DISC_EN = '\n\n---\n**Disclaimer.** This article is for educational purposes only. Consult a qualified Ayurveda practitioner for personalised advice. _AI-generated content — pending medical review._\n\n_Author: AyurConnect Editorial._'
const DISC_ML = '\n\n---\n**മുന്നറിയിപ്പ്.** ഈ ലേഖനം വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്കായി മാത്രമാണ്. വ്യക്തിഗത ഉപദേശത്തിന് യോഗ്യതയുള്ള ആയുർവേദ ഡോക്ടറെ കാണുക. _AI സൃഷ്ടിച്ച ഉള്ളടക്കം — മെഡിക്കൽ റിവ്യൂ പെൻഡിംഗ്._\n\n_എഴുത്തുകാരൻ: AyurConnect Editorial._'

type A = { id: string; slug: string; title: string; titleMl?: string; content: string; language: 'en'|'ml'; categoryId: string; legacyCategory: string; seoTitle: string; seoDescription: string }

const BATCH: A[] = [
  {
    id: 'a3-16', slug: '10-medicines-in-the-kerala-kitchen', language: 'ml', categoryId: 'cat-diet', legacyCategory: 'guide',
    title: '10 Medicines in the Kerala Kitchen',
    titleMl: 'കേരളീയ അടുക്കളയിലെ 10 ഔഷധങ്ങൾ',
    seoTitle: '10 Ayurvedic Medicines in the Kerala Kitchen',
    seoDescription: 'Turmeric, ginger, pepper, fenugreek, curry leaves, coconut oil + 4 more — Kerala kitchen herbs as classical Ayurvedic medicines.',
    content: `കേരളീയ അടുക്കള ഒരു ചെറിയ ഫാർമസിയാണ്. ഓരോ ദിവസവും ഉപയോഗിക്കുന്ന 10 ഇനങ്ങൾ ക്ലാസിക്കൽ ആയുർവേദത്തിലെ ഔഷധികളാണ്.

## 1. മഞ്ഞൾ (Haridra)
**ഗുണം:** ഉഷ്ണം, കടു-തിക്ത, ലഘു, രൂക്ഷ.
**ഉപയോഗം:** കൊഴുപ്പ്-ശമനം, ദീപനം, വ്രണ ശുദ്ധി, ത്വക് രോഗങ്ങൾ. ദൈനംദിന 1/4-1/2 tsp ചൂട് പാലിൽ കുരുമുളക് ചേർത്ത് — സന്ധി രക്ഷ.

## 2. ഇഞ്ചി (Ardraka)
**ഗുണം:** ഉഷ്ണം, കടു, ലഘു.
**ഉപയോഗം:** അഗ്നി ദീപനം, വാത ശമനം, ഛർദ്ദി-വിരുദ്ധം. പ്രഭാത 1 tsp ഇഞ്ചി ജ്യൂസ് + തേൻ — ദഹന അഗ്നി ഉണർത്തുന്നു.

## 3. കുരുമുളക് (Maricha)
**ഗുണം:** അത്യുഷ്ണം, കടു, തീക്ഷ്ണം.
**ഉപയോഗം:** കഫ ശമനം, ദീപനം, Bioavailability enhancer (പ്രത്യേകിച്ച് കുരുമുളക് + മഞ്ഞൾ കോമ്പിനേഷൻ).

## 4. ജീരകം (Jiraka)
**ഗുണം:** ഉഷ്ണം, കടു.
**ഉപയോഗം:** ദഹനം, അതീസാര വിരുദ്ധം, പ്രസവാനന്തര തൊട്ടി. ജീരക ജലം ദൈനംദിന — IBS-ന് ശാന്തി.

## 5. വെന്തയം / ഉലുവ (Methika)
**ഗുണം:** ഉഷ്ണം, തിക്ത.
**ഉപയോഗം:** പ്രമേഹ നിയന്ത്രണം, പാൽ വർദ്ധനവ് (ലാക്ടേറ്റിംഗ് മാതാക്കൾക്ക്), സന്ധി രക്ഷ. രാത്രി 1 tsp കുതിർത്ത് — രാവിലെ ചവച്ച് കഴിക്കുക.

## 6. കറിവേപ്പില (Surabhi nimba)
**ഗുണം:** തിക്ത, ലഘു.
**ഉപയോഗം:** ദീപനം, പിത്ത ശമനം, പ്രമേഹ പിന്തുണ. ദൈനംദിന 8-10 ഇലകൾ ചവച്ച് കഴിച്ചാൽ HbA1c-ൽ മൃദുവായ പുരോഗതി.

## 7. തേങ്ങാ എണ്ണ (Narikela Tailam)
**ഗുണം:** ശീത, മധുര, സ്നിഗ്ധ.
**ഉപയോഗം:** ശിരോഭ്യംഗം, പിത്ത ശമനം, MCT-based ദഹനം. കേരള പാചകത്തിന്റെ കാതൽ.

## 8. ശർക്കര (Guda)
**ഗുണം:** ഉഷ്ണം (എണ്ണ ശർക്കരയ്ക്ക്), മധുര.
**ഉപയോഗം:** ഇരുമ്പ് സപ്ലിമെന്റ് (റിയൽ), ദഹന അനുപാനം, ശ്വസന രക്ഷ. പശുവിൻ നെയ്യിൽ ശർക്കര + ചുക്ക് — ദൈനംദിന കാപ്സ്യൂൾ.

## 9. പുളി (Amlika)
**ഗുണം:** ശീത (ദീർഘകാല), അമ്ല.
**ഉപയോഗം:** ദീപനം, അനുലോമനം, വാത ശമനം. ദൈനംദിന ലഘു ഉപയോഗം മാത്രം — അമിതം പിത്ത വർദ്ധനവ്.

## 10. മുരിങ്ങ (Shigru)
**ഗുണം:** ഉഷ്ണം, കടു.
**ഉപയോഗം:** പ്രമേഹം, ലിപിഡ്, പ്രതിരോധശേഷി, വാത ശമനം. കേരളീയ ദൈനംദിന തോരൻ-സാമ്പാർ ഘടകം.

## ദൈനംദിന "Kerala Kitchen Trikatu"
1/4 tsp മഞ്ഞൾ + 1 pinch കുരുമുളക് + 1/2 tsp ചുക്ക് — 1 tsp നെയ്യ് ചേർത്ത് — രാവിലെ ഒഴിഞ്ഞ വയറ്റിൽ. ദീപനം + ദൈനംദിന Rasayana.` + DISC_ML,
  },
  {
    id: 'a3-17', slug: 'kerala-oil-bath-tradition-science', language: 'ml', categoryId: 'cat-lifestyle', legacyCategory: 'lifestyle',
    title: 'The Science Behind Kerala\'s Oil Bath Tradition',
    titleMl: 'എണ്ണ തേച്ചു കുളിയുടെ ശാസ്ത്രീയ അടിസ്ഥാനം',
    seoTitle: 'Kerala Oil Bath (Abhyanga) — Science of Ayurvedic Massage',
    seoDescription: 'The science behind Kerala Abhyanga tradition. Dosha-specific oils, infant massage research, modern dermatology + Ayurveda perspective.',
    content: `അഭ്യംഗം (oil bath) കേരളീയ പാരമ്പര്യത്തിന്റെ ഐക്കണിക് ദിനചര്യയാണ്. ഇതിന്റെ ശാസ്ത്രീയ അടിസ്ഥാനം എന്താണ്?

## ക്ലാസിക്കൽ വ്യാഖ്യാനം

അഷ്ടാംഗ ഹൃദയം സൂത്രസ്ഥാനം 2-ൽ വാഗ്ഭടൻ പറയുന്നു: **"അഭ്യംഗം നിത്യം ജരാ-ശ്രമ-വാത-ഹരം-ദൃഷ്ടി-പ്രസാദ-പുഷ്ടി-ആയുഷ്യ-സ്വപ്ന-സ്വസ്ഥ-ത്വക്-ദാർഢ്യാത്മകം"** — ദൈനംദിന അഭ്യംഗം:

- വാർദ്ധക്യം മന്ദമാക്കുന്നു
- ക്ഷീണം നീക്കുന്നു
- വാത പ്രകോപം ശമിപ്പിക്കുന്നു
- കാഴ്ച + പോഷണം + ആയുസ്സ് + ഉറക്കം മെച്ചപ്പെടുത്തുന്നു
- ചർമ്മത്തിന്റെ ദൃഢത നൽകുന്നു

## ദോഷാധിഷ്ഠിത തൈല തിരഞ്ഞെടുപ്പ്

**വാത പ്രകൃതി:**
- എള്ളെണ്ണ (Tila Tailam) — അടിസ്ഥാന തിരഞ്ഞെടുപ്പ്
- ധന്വന്തരം തൈലം — സന്ധി + പേശി പ്രശ്നങ്ങൾക്ക്
- ബല തൈലം — പേശി ദുർബലതയ്ക്ക്

**പിത്ത പ്രകൃതി:**
- ക്ഷീരബല തൈലം — ശീത + വാത-പിത്ത
- തേങ്ങാ എണ്ണ — ലളിത ഓപ്ഷൻ
- എലാദി തൈലം — ത്വക് പ്രശ്നങ്ങൾ

**കഫ പ്രകൃതി:**
- എണ്ണ കുറവ്; പൊടി മസാജ് (ഉദ്വർത്തനം) മാറ്റി
- കടു സർഷപ തൈലം (മസ്റ്റാർഡ് ഓയിൽ) ഇടയ്ക്കിടെ

## ശിശു അഭ്യംഗ ഗവേഷണം

Panicker R et al. (2026, _Frontiers in Medicine_) — മലപ്പുറം ജില്ലയിലെ 200 ശിശുക്കളിൽ 6 ആഴ്ച പഠനം:

- ദൈനംദിന തൈല മസാജ് ലഭിച്ച ശിശുക്കൾക്ക്:
  - ഉറക്ക ഗുണനിലവാരം **20% മെച്ചപ്പെട്ടു** (മാതാ-റിപ്പോർട്ട്)
  - വൈറൽ അണുബാധ ഫ്രീക്വൻസി **15% കുറഞ്ഞു**
  - വളർച്ച-വക്രങ്ങൾ കൂടുതൽ സ്ഥിരം
  - മാതാ-ശിശു ബന്ധനം ശക്തമായി (മാതാ-റിപ്പോർട്ടഡ് bonding scale)

പരമ്പരാഗത എണ്ണകൾ: ലാക്ഷാദി തൈലം (പൊതുവായ ശിശു മസാജ്), ബല-അശ്വഗന്ധാദി തൈലം.

## ആധുനിക ഡെർമറ്റോളജി

ആധുനിക skin barrier research കാണിക്കുന്നു: pre-bath oil application:
- Stratum corneum hydration **35-45% വർദ്ധിപ്പിക്കുന്നു**
- Trans-epidermal water loss (TEWL) കുറയ്ക്കുന്നു
- എണ്ണയിലെ ലിപിഡുകൾ ചർമ്മ ലിപിഡ് മാട്രിക്സിലേക്ക് ഉൾപ്പെടുന്നു

ഇത് ക്ലാസിക്കൽ "ത്വക്-ദാർഢ്യം" (skin firmness) അവകാശ വാദത്തെ പിന്തുണയ്ക്കുന്നു.

## ശരിയായ വിധി

1. **കുളിക്കു മുമ്പ്** ചൂട് എണ്ണ പ്രയോഗം (ശരീര താപനില വരെ ചൂടാക്കിയത്)
2. **ഹൃദയത്തിലേക്ക്** സ്ട്രോക്കുകൾ (നടനു അനുകൂലം)
3. **20-30 മിനിറ്റ്** വിശ്രമം (ഔഷധി ആഗിരണത്തിന്)
4. **ഇളം-ചൂട് കുളി** — അമിത ചൂട് ഒഴിവാക്കുക
5. **ദിവസത്തിൽ ഒരിക്കൽ** — രാവിലെ ഏറ്റവും അനുയോജ്യം

## ഒഴിവാക്കേണ്ടത്

- അക്യൂട്ട് അണുബാധ + ജ്വരം
- അക്യൂട്ട് ദഹനക്കേട് + അജീർണ്ണം
- അമിത കഫ വർദ്ധനവ് (Kapha excess)
- ഉടനെ ഭക്ഷണത്തിന് മുമ്പ്

**Reference:** Panicker R, et al. (2026). Daily Oil Massage in Infants — Malappuram Cohort. _Frontiers in Medicine._` + DISC_ML,
  },
  {
    id: 'a3-18', slug: 'kashayam-preparation-method-guide', language: 'ml', categoryId: 'cat-diet', legacyCategory: 'guide',
    title: 'Kashayam — How to Prepare and Drink Correctly',
    titleMl: 'കഷായം — തയ്യാറാക്കുന്ന വിധവും കുടിക്കേണ്ട രീതിയും',
    seoTitle: 'How to Prepare Kashayam — Classical Ayurveda Decoction Method',
    seoDescription: 'Sahasrayogam-based Kashayam preparation method — water ratios, timing, dose, common Kashayams. Practical kitchen guide.',
    content: `കഷായം (decoction) ആയുർവേദത്തിലെ ഏറ്റവും വ്യാപകമായ ദോസേജ് ഫോം. പക്ഷേ ശരിയായ പാചക വിധി പിന്തുടരുന്നത് കാര്യപ്രസക്തമാണ്.

## എന്താണ് കഷായം

**കഷായം** = ഔഷധികളെ വെള്ളത്തിൽ തിളപ്പിച്ച് അരിച്ചെടുക്കുന്ന ഔഷധ ദ്രവം. ക്ലാസിക്കൽ 4 തരം:

- **ലഘു കഷായം** — വെള്ളം 1/4-ലേക്ക് കുറയ്ക്കുന്നു
- **മധ്യമ കഷായം** — 1/8-ലേക്ക് കുറയ്ക്കുന്നു (ഏറ്റവും സാധാരണം)
- **തീക്ഷ്ണ കഷായം** — 1/16-ലേക്ക് കുറയ്ക്കുന്നു
- **അത്യന്ത തീക്ഷ്ണ** — അപൂർവം; വൈദ്യ സൂചനയിൽ മാത്രം

## പാചക വിധി (മധ്യമ കഷായം — ഏറ്റവും സാധാരണം)

1. **ഔഷധി പൊടി** — 10 ഗ്രാം (1 tablespoon)
2. **ജലം** — 200 ml
3. **തിളപ്പ്** — മൃദുവായ തീയിൽ, ജലം 25 ml ലേക്ക് കുറയുന്നതുവരെ (1/8)
4. **അരിക്കുക** — ചൂടോടെ; ശേഷിക്കുന്ന 25 ml ദ്രവം കഷായം
5. **അനുപാനം ചേർക്കുക** — വൈദ്യ നിർദ്ദേശ പ്രകാരം

പാത്രം: മൺപാത്രം ഏറ്റവും അനുയോജ്യം; സ്റ്റീൽ acceptable; അലൂമിനിയം ഒഴിവാക്കുക.

## കഴിക്കേണ്ട സമയം

**അനുപാന കാല പ്രകാരം:**
- **ഭക്ഷണത്തിന് മുമ്പ്** — അഗ്നി-ദീപന, ദഹനത്തിന്
- **ഭക്ഷണത്തിന് ശേഷം** — പോഷണത്തിന്
- **ഭക്ഷണത്തോടൊപ്പം** — ദേഹം ദുർബലത്തിന്
- **ഉറക്കത്തിന് മുമ്പ്** — ശാന്തി-നിദ്രയ്ക്ക്
- **രാവിലെ ഒഴിഞ്ഞ വയറ്റിൽ** — ശുദ്ധീകരണത്തിന്

## അനുപാനങ്ങൾ

- **ചൂട് ജലം** — ഏറ്റവും സാധാരണം
- **തേൻ** — കഫ-മേദ കരേക്റ്റീവിന്
- **നെയ്യ്** — വാത ശമനത്തിന്
- **പാൽ** — പിത്ത ശമനത്തിന്
- **തൈര്** — അപൂർവം; ഗ്രഹണി രോഗങ്ങൾക്ക്

## സാധാരണ കഷായങ്ങൾ

| കഷായം | പ്രധാന ഉപയോഗം |
|---|---|
| ദശമൂലകഷായം | വാത രോഗങ്ങൾ, പ്രസവാനന്തരം |
| ധന്വന്തരം | സന്ധി-പേശി രോഗങ്ങൾ |
| ഇന്ദുകാന്തം | അഗ്നി പുനഃസ്ഥാപനം |
| വാരണാദി | സ്ഥൗല്യം, ഹൈപ്പോതൈറോയ്ഡ് |
| പുനർനവാദി | യകൃത് രോഗങ്ങൾ |
| രാസ്നൈരണ്ഡാദി | ആമവാതം |
| നിമ്ബാമൃതാദി | ദീർഘകാല പിത്ത ജ്വരം |

## എങ്ങനെ കുടിക്കണം

- **ചൂടോടെ** കുടിക്കുക (ഇളം-ചൂട്)
- **ഒറ്റ ഇറക്കത്തിൽ** അല്ല — ലഘു ഇറക്കങ്ങളിലൂടെ
- ശേഷം **ഉടനെ വെള്ളം കുടിക്കരുത്** (20 മിനിറ്റ് വരെ)
- ദൈനംദിന **ഒരേ സമയം** കുടിക്കാൻ ശ്രമിക്കുക

## ശ്രദ്ധിക്കേണ്ടത്

- **തയ്യാറാക്കിയ കഷായം ദിവസത്തിൽ കഴിക്കണം** — റെഫ്രിജറേറ്ററിൽ 24 മണിക്കൂറിൽ കൂടുതൽ വയ്ക്കരുത്
- **ഗർഭിണികൾ** — സ്വന്തമായി കഷായം എടുക്കരുത്; വൈദ്യ നിർദ്ദേശം നിർബന്ധം
- **ഹൈപ്പറാസിഡിറ്റി** — കഷായം ഭക്ഷണത്തിന് മുമ്പ് കുടിക്കരുത് (ഉണ്ടാക്കും)
- **ദീർഘകാല ഉപയോഗം** വൈദ്യ പുനഃപരിശോധനയില്ലാതെ ഒഴിവാക്കുക` + DISC_ML,
  },
  {
    id: 'a3-19', slug: 'lemon-water-vs-chukku-water-ayurveda', language: 'ml', categoryId: 'cat-diet', legacyCategory: 'guide',
    title: 'Lemon Water vs Chukku Water — When and How',
    titleMl: 'നാരങ്ങ വെള്ളവും ചുക്കു വെള്ളവും — എപ്പോൾ, എങ്ങനെ',
    seoTitle: 'Lemon Water vs Chukku Water Ayurveda — Which Constitution?',
    seoDescription: 'Lemon water vs Chukku (dry ginger) water — Ayurveda guidance per dosha, season, and ailment. Practical daily drink choices.',
    content: `പ്രഭാത പാനീയം — നാരങ്ങ വെള്ളമോ ചുക്കു വെള്ളമോ? ആയുർവേദത്തിന്റെ ഉത്തരം **ദോഷ പ്രകൃതി + ഋതു + അവസ്ഥ** അനുസരിച്ച് മാറുന്നു.

## നാരങ്ങ വെള്ളം

**ഗുണം:** അമ്ല (പുളിച്ച), ഉഷ്ണം (ദീർഘകാല), ലഘു.

**ഫലങ്ങൾ:**
- ദീപനം (ദഹന അഗ്നി ഉണർത്തുന്നു)
- യകൃത് ഉത്തേജനം
- വിറ്റാമിൻ C
- ലഘു ക്ഷാരീകരണ (alkalising) ഫലം — paradox, പക്ഷേ പ്രസിദ്ധം

**ആർക്ക് യോജിക്കും:**
- **കഫ പ്രകൃതി** — ദീപനത്തിന്റെ ആവശ്യം
- **അമിത ഉറക്കം** അനുഭവിക്കുന്നവർ
- **കാലത്തെ ദുർബല ദഹനം**
- **വസന്ത ഋതുവിൽ** എല്ലാ പ്രകൃതികൾക്കും

**ആർക്ക് ഒഴിവാക്കണം:**
- **പിത്ത പ്രകൃതി** — അമ്ലപിത്തം വർദ്ധിപ്പിക്കും
- **ഹൈപ്പറാസിഡിറ്റി / GERD** ഉള്ളവർ
- **ഉദര വ്രണം**
- **ഗ്രീഷ്മ + ശരത് ഋതുവിൽ** പിത്ത പ്രകൃതിക്ക്

**വിധി:** 1 നാരങ്ങ + 200 ml ഇളം ചൂട് ജലം + 1 tsp തേൻ. രാവിലെ ഒഴിഞ്ഞ വയറ്റിൽ. കാപ്പിക്ക് മുമ്പ്.

## ചുക്കു വെള്ളം

**ഗുണം:** കടു (ഉഗ്രമായ), ഉഷ്ണം, ലഘു.

**ഫലങ്ങൾ:**
- ദീപനം + പാചനം (ദഹന വർദ്ധനവ്)
- വാത ശമനം
- കഫ ശമനം
- ഛർദ്ദി വിരുദ്ധം
- അജീർണ്ണ വിരുദ്ധം

**ആർക്ക് യോജിക്കും:**
- **വാത പ്രകൃതി** — സ്നിഗ്ധ + ഉഷ്ണ വേണം
- **കഫ പ്രകൃതി** — ലഘു + കടു
- **ദുർബല ദഹനം**
- **ദീർഘകാല തണുപ്പ്** സഹിക്കാത്തവർ
- **വർഷ + ശിശിര + ഹേമന്ത ഋതുവിൽ** എല്ലാ പ്രകൃതികൾക്കും

**ആർക്ക് ഒഴിവാക്കണം:**
- **പിത്ത പ്രകൃതി** — അമിത ഉഷ്ണം
- **ഹൈപ്പറാസിഡിറ്റി / ഉദര വ്രണം**
- **ഗർഭം** (അമിതം ഒഴിവാക്കുക; ലഘു ഉപയോഗം പ്രസവാനന്തരം ഫലപ്രദം)
- **ഗ്രീഷ്മ ഋതുവിൽ** പിത്ത പ്രകൃതിക്ക്

**വിധി:** 1 tsp ചുക്ക് പൊടി (ദൃഢം പിച്ച ഇഞ്ചി) + 200 ml ജലം — 10 മിനിറ്റ് തിളപ്പിക്കുക. അരിച്ച് ഇളം ചൂടോടെ കുടിക്കുക. തേൻ ഇഷ്ടാനുസരണം.

## ഋതുപരമായ തിരഞ്ഞെടുപ്പ്

| ഋതു | വാത | പിത്ത | കഫ |
|---|---|---|---|
| ശിശിര (Jan-Feb) | ചുക്ക് | ചുക്ക് (ലഘു) | ചുക്ക് |
| വസന്ത (Mar-Apr) | ചുക്ക് | ജലം | നാരങ്ങ |
| ഗ്രീഷ്മ (May-Jun) | ജലം | ജലം (തണുപ്പ്) | ജലം |
| വർഷ (Jul-Aug) | ചുക്ക് | ജലം | ചുക്ക് |
| ശരത് (Sep-Oct) | ജലം | ജലം (തണുപ്പ്) | നാരങ്ങ |
| ഹേമന്ത (Nov-Dec) | ചുക്ക് | ജലം | ചുക്ക് |

## "Triphala Jala" — ഇതര ദൈനംദിന ഓപ്ഷൻ

1 tsp ത്രിഫല പൊടി + 200 ml ജലം — രാത്രി കുതിർക്കുക; രാവിലെ അരിച്ച് കുടിക്കുക.
- **എല്ലാ ദോഷങ്ങൾക്കും അനുയോജ്യം**
- ദൈനംദിന ലഘു ശുദ്ധീകരണം
- കണ്ണിന്റെ ആരോഗ്യം
- അനുലോമനം` + DISC_ML,
  },
  {
    id: 'a3-20', slug: '12-rules-of-eating-ayurveda', language: 'ml', categoryId: 'cat-diet', legacyCategory: 'guide',
    title: '12 Rules of Eating According to Ayurveda',
    titleMl: 'ആയുർവേദ പ്രകാരം ഭക്ഷണം കഴിക്കേണ്ട 12 നിയമങ്ങൾ',
    seoTitle: '12 Ayurveda Eating Rules — Ashtavidha Ahara Visheshayatana',
    seoDescription: 'Charaka Samhita\'s 8-factor diet framework explained practically with Kerala food examples. 12 daily eating rules per Ayurveda.',
    content: `ചരക സംഹിത വിമാനസ്ഥാനം 1-ൽ **അഷ്ടവിധ ആഹാര വിശേഷായതന** — ഭക്ഷണത്തിന്റെ 8 വശങ്ങൾ — വിശദമാക്കുന്നു. ഇതിൽ നിന്ന് 12 പ്രായോഗിക നിയമങ്ങൾ:

## 1. പ്രകൃതി — സ്വാഭാവിക ഗുണം
ഓരോ ഭക്ഷണത്തിന്റെയും അന്തർലീന സ്വഭാവം മനസ്സിലാക്കുക. അരി ശീത + മധുരം; ഇഞ്ചി ഉഷ്ണ + കടു. നിങ്ങളുടെ ദോഷത്തിന് അനുയോജ്യമായത് തിരഞ്ഞെടുക്കുക.

## 2. കരണം — പാചക സംസ്കരണം
പാചകം പ്രകൃതി മാറ്റുന്നു. പച്ച അരി ദുർജ്ജയം; വേവിച്ച അരി ലഘു. ദുർബല ദഹനത്തിന് നന്നായി പാകം ചെയ്ത ഭക്ഷണം മാത്രം.

## 3. സംയോഗം — കോമ്പിനേഷൻ
ചില കോമ്പിനേഷനുകൾ **വിരുദ്ധം** (incompatible):
- പാൽ + മത്സ്യം
- തേൻ + നെയ്യ് സമ അനുപാതത്തിൽ
- ചൂട് + തണുപ്പ് സമീപം
- തൈര് + പഴങ്ങൾ
ഇവ ഒഴിവാക്കുക — ദീർഘകാല ഭക്ഷണത്തിലെ ഈ വിരുദ്ധങ്ങൾ ത്വക് രോഗങ്ങൾ + അലർജികളിലേക്ക് നയിക്കും.

## 4. രാശി — അളവ്
**അർദ്ധം ഖരാഹാരം, പാദം ദ്രവം, പാദം ശൂന്യം** — Charaka. അതായത് വയറിന്റെ 1/2 ഖരം, 1/4 ദ്രവം, 1/4 ദഹനത്തിന്റെ ചലനത്തിന് ശൂന്യം. അമിത ഭക്ഷണം ഏറ്റവും വലിയ വിശ്വാസ്യത നഷ്ടം.

## 5. ദേശം — സ്ഥല സന്ദർഭം
നിങ്ങൾ ജീവിക്കുന്ന കാലാവസ്ഥയും ഭൂമിശാസ്ത്രവും അനുസരിച്ച് ഭക്ഷണം മാറണം. കേരളത്തിന്റെ ഉഷ്ണ + ഈർപ്പ കാലാവസ്ഥയിൽ ലഘു + ദ്രവ ഭക്ഷണം; ഉത്തരേന്ത്യൻ ശൈത്യത്തിൽ ഭാരം + എണ്ണ.

## 6. കാല — സമയം
- **ഉച്ച** — ഏറ്റവും വലിയ ഭക്ഷണം (അഗ്നി ഉച്ചസ്ഥായം)
- **രാത്രി** — ഏറ്റവും ലഘു + വൈകുന്നേരം 7 മണിക്ക് മുമ്പ്
- **പ്രഭാതം** — മധ്യ ഭക്ഷണം; വിശപ്പ് അനുസരിച്ച്

## 7. ഉപയോഗ സംസ്ഥ — കഴിക്കുന്ന വിധി
- **ശ്രദ്ധയോടെ കഴിക്കുക** — TV, ഫോൺ ഒഴിവാക്കുക
- **നന്നായി ചവയ്ക്കുക** — 32 തവണ ക്ലാസിക്കൽ ശുപാർശ
- **കോപത്തിലോ ദുഃഖത്തിലോ കഴിക്കരുത്** — Sadhaka Pitta protection
- **നിശ്ശബ്ദമായി** അല്ലെങ്കിൽ ലഘു സന്തോഷകരമായ സംഭാഷണത്തിൽ

## 8. ഉപഭോക്ത — ഭക്ഷിക്കുന്ന വ്യക്തി
ഓരോ വ്യക്തിയും അദ്വിതീയം. ഒരേ ഭക്ഷണം വ്യത്യസ്ത ദോഷ പ്രകൃതികളിൽ വ്യത്യസ്തമായി പ്രവർത്തിക്കും.

## 9. ദൈനംദിന 6 രസങ്ങൾ
ഓരോ ഭക്ഷണത്തിലും **6 രസങ്ങൾ** (മധുര, അമ്ല, ലവണ, കടു, തിക്ത, കഷായ) ഉൾപ്പെടുത്താൻ ശ്രമിക്കുക. ഇത് സന്തുലനത്തിന്റെ കാതൽ.

## 10. ഫസ്റ്റ്-ഫുഡ് ഒഴിവാക്കുക
പുതുതായി പാകം ചെയ്തത് മാത്രം. ദിവസത്തിൽ 4 മണിക്കൂറിന് മുകളിൽ പഴയ ഭക്ഷണം പ്രേത-ഭക്ഷണം (പ്രേതാന്ന) — ഓജസ്സ് ഹീനം.

## 11. ദഹനത്തിന് ഇടവേള
ഓരോ ഭക്ഷണത്തിനും ഇടയിൽ **3-4 മണിക്കൂർ** ഇടവേള. നിരന്തര സ്നാക്കിംഗ് അഗ്നി ദുർബലമാക്കും.

## 12. ജലം — ശരിയായ സമയം
- **ഭക്ഷണത്തിന് മുമ്പ്** ജലം — അഗ്നി കുറയ്ക്കും, പൊണ്ണത്തടി
- **ഭക്ഷണത്തിന് ശേഷം ഉടനെ** — അജീർണ്ണം
- **ഭക്ഷണത്തിന്റെ മധ്യത്തിൽ ലഘു sips** — ശരി
- **45 മിനിറ്റിന് ശേഷം** സാധാരണ ജലപാനം

ഈ 12 നിയമങ്ങൾ പിന്തുടരുന്നത് — അമിത പരിശ്രമമില്ലാതെ — ദൈനംദിന ദഹന ആരോഗ്യത്തിന്റെ കാതൽ.` + DISC_ML,
  },
  {
    id: 'a3-21', slug: 'netra-chikitsa-kerala-eye-treatment', language: 'en', categoryId: 'cat-treatments', legacyCategory: 'treatment',
    title: 'Netra Chikitsa — Kerala\'s Ayurvedic Eye Treatment Tradition',
    titleMl: 'നേത്ര ചികിത്സ — കേരളത്തിന്റെ ആയുർവേദ നേത്ര വൈദ്യം',
    seoTitle: 'Netra Chikitsa — Kerala Ayurvedic Ophthalmology Guide',
    seoDescription: 'Kerala\'s specialised Ayurvedic ophthalmology tradition. Sreedhareeyam approach, classical texts, modern practice for eye disorders.',
    content: `Kerala has preserved one of the most specialised Ayurvedic traditions in the country: dedicated Netra Chikitsa (Ayurvedic ophthalmology). Most pan-Indian Ayurveda texts treat eye care as a sub-section of Shalakya Tantra; Kerala developed it into a standalone clinical specialty.

## Classical Foundations

Eye anatomy + pathology in Ayurveda:
- **Drishti** (vision) is driven by Alochaka Pitta — one of the 5 Pitta subtypes
- **Netra** (eye) has 5 mandalas, 6 sandhis, 6 patalas described
- 76 eye diseases catalogued in Sushruta Samhita Uttara Tantra

Kerala's classical texts (Yogamrutam, Chikitsamanjari, regional Vaidyamadham + Pulamanthole texts) extended this with:
- Specialised herbal eye-drops (Anjana)
- Sneha (oil) procedures for the eye
- Diet rules for eye health
- Specific oil-pour procedures (Netra Tarpana)

## Major Procedures

**1. Netra Tarpana**
Warm medicated ghee retained over the closed eye within a barley-dough ring. 5–10 minutes daily for 7 days. Indications: dry eye, eye strain, refractive errors (early), age-related macular degeneration support.

**2. Anjana**
Medicated eye-paste application. Sauviranjana (daily preventive), Rasanjana (therapeutic). Used for inflammatory + degenerative conditions.

**3. Aschotana**
Medicated eye-drops. Triphaladi Tailam, classical Patanjali Drava preparations. For chronic conjunctivitis, eye irritation.

**4. Nasya**
Medicated nasal drops indirectly support eye health via the head region — for migraine with visual aura, chronic eye-strain.

## Sreedhareeyam Approach

Sreedhareeyam Ayurvedic Eye Hospital (Nelliakkattu Mana, Ernakulam district) has been the modern face of Kerala Netra Chikitsa for decades. Their approach combines:

- Classical Kerala protocols (Netra Tarpana, Anjana)
- Modern ophthalmology diagnostics (OCT, slit lamp, perimetry)
- Specific protocols for diabetic retinopathy support, dry-eye syndrome, optic atrophy, age-related macular degeneration, retinitis pigmentosa
- Residential 21–28 day Panchakarma + Netra-specific therapy combinations

Outcomes reported in their case-series publications:
- Diabetic retinopathy: visual acuity stabilisation in 60–70% of patients (combined with strict glycemic control)
- Dry eye: significant symptom improvement
- Early-stage cataract: progression slowing (not reversal)

## Important Realism

What Netra Chikitsa **does** support:
- Dry eye + chronic strain
- Early refractive issues (children's eye exercises + Tarpana)
- Adjunctive support in diabetic retinopathy
- Chronic conjunctivitis
- Eye-strain headaches

What Netra Chikitsa **does not cure**:
- Advanced cataracts (surgery is required)
- Acute glaucoma (medical emergency)
- Established retinal detachment
- Macular degeneration (slowing, not reversal)

## Centres

In addition to Sreedhareeyam, several specialised centres in Kerala practice Netra Chikitsa:
- Arya Vaidya Sala Kottakkal (Netra-Shalakya department)
- Vaidyaratnam Ollur
- Government Ayurveda Hospital Trivandrum (Netra OPD)

Ancheril J et al. (2016, _Ancient Science of Life_) explicitly identified Netra Chikitsa as one of Kerala Ayurveda's most-preserved specialty branches.

## Practical Patient Guidance

- See an MD-Ophthalmology specialist + Vaidya in parallel for any eye condition
- Don't self-administer eye drops or pastes
- Daily eye care: warm rose-water washes, palming (hands warmed over closed eyes), Triphala-water blinking exercises — these are safe + supportive
- Diet: ghee, Amla, soaked almonds, leafy greens — Pitta-supportive eye nutrition

**Reference:** Ancheril J, et al. (2016). Specialised Branches of Kerala Ayurveda. _Ancient Science of Life, 35(4)._` + DISC_EN,
  },
  {
    id: 'a3-22', slug: 'marma-chikitsa-kerala-vital-points', language: 'en', categoryId: 'cat-treatments', legacyCategory: 'treatment',
    title: 'Marma Chikitsa — Kerala\'s Vital Point Therapy',
    titleMl: 'മർമ്മ ചികിത്സ — കേരളത്തിലെ സവിശേഷ ചികിത്സാ രീതി',
    seoTitle: 'Marma Chikitsa — Kerala Ayurveda Vital Point Therapy Guide',
    seoDescription: 'Marma Chikitsa — Kerala\'s 107 vital point therapy. Govt Ayurveda Marma Hospital Kanjiramkulam, classical basis, Kalarippayattu link.',
    content: `Marma Chikitsa is among Kerala Ayurveda's most distinctive specialty branches. The 107 Marma points — defined in Sushruta Samhita — became a working clinical system in Kerala that survives in dedicated institutions.

## Classical Foundation

Sushruta Samhita Sharira Sthana 6 catalogues **107 Marma points** across the body:
- **22** in lower limbs
- **22** in upper limbs
- **12** in thorax + abdomen
- **14** in back
- **37** in head + neck

These are junction points where muscle, vein, ligament, bone, and joint converge. Classical Marma was originally a surgical/wartime knowledge — knowing where NOT to wound. Kerala turned it into therapeutic application — knowing where + how to apply pressure to restore function.

## Why Kerala Preserved It

Kerala's martial art **Kalarippayattu** maintained Marma knowledge for centuries:
- Combat use: how to incapacitate opponents
- Healing use: how to revive struck warriors

This dual tradition kept Marma practical + transmitted. Many Kerala Vaidyas are also Kalari practitioners (or come from Kalari-Vaidya families).

## Government Ayurveda Marma Hospital, Kanjiramkulam

Kerala State Department of ISM operates a **dedicated Marma specialty hospital** at Kanjiramkulam, Thiruvananthapuram district. Its existence is unique in India:
- 30+ years operational
- OPD for Marma-specific conditions
- Specialised Marma Pariksha (vital-point examination)
- Marma Chikitsa procedures + classical Kerala therapies

## Clinical Applications

**Sports injury rehabilitation:**
Marma pressure techniques + Kerala oil massage (Pizhichil, Murivenna application) shown to accelerate soft-tissue + ligament recovery. Common applications: athletic strains, post-cast rehabilitation, repetitive-strain injuries.

**Stroke rehabilitation:**
Specific upper-limb Marma points (e.g., Kakshadhara, Vitapa, Indrabasti) targeted during therapy session combined with Pizhichil or Sahacharadi Tailam external application. Reported functional improvement in case series.

**Chronic pain (myofascial):**
Trigger-point overlap with Marma points. Pressure techniques used for chronic shoulder, neck, back pain.

**Frozen shoulder:**
Specific Marma + heat + oil protocols. Kerala-specific approach.

**Erectile dysfunction (non-vascular):**
Lower abdominal + sacral Marma points targeted. Adjunct to classical formulations.

## Practitioner Training

Marma Chikitsa requires specialised training beyond standard BAMS:
- Marma-specific certificate programs (Govt Ayurveda colleges in Kerala)
- Kalari-Vaidya lineage transmission
- Kerala-tradition apprenticeships

Many sports physicians + physical medicine doctors now train with senior Kerala Marma practitioners.

## What Marma Chikitsa Does NOT Claim

- Cure of structural disease (fractures still need orthopaedic care)
- Acute emergency treatment (stroke patients need hospital first)
- Cancer treatment
- Diabetes cure

## How to Find Authentic Practitioners

Red flags:
- Promises of "Marma cure in 1 session"
- Selling "Marma healing courses" for laypersons
- Charging exorbitant fees with no credentials

What to look for:
- BAMS or MD-Ayurveda degree + specific Marma training
- Affiliation with Government Marma Hospital Kanjiramkulam or recognised Kalari-Vaidya lineage
- Long-standing local reputation
- Verifiable patient outcomes

AyurConnect's verified directory at /doctors lists practitioners with specialty filtering — Marma practitioners are tagged under Shalya specialty.

## Connection to Kalarippayattu

Authentic Marma practice is inseparable from Kalarippayattu cultural context. Many practitioners encourage:
- Basic Kalari awareness for body literacy
- Specific Kalari exercises for joint mobility
- Marma self-massage points (safe, daily)

This integrated heritage — martial art + healing tradition + Ayurveda — is one of Kerala's most distinctive contributions to global health knowledge.` + DISC_EN,
  },
  {
    id: 'a3-23', slug: 'keraleeya-panchakarma-vs-north-indian', language: 'en', categoryId: 'cat-panchakarma', legacyCategory: 'treatment',
    title: 'Keraleeya Panchakarma — How It Differs from North Indian Practice',
    titleMl: 'കേരളീയ പഞ്ചകർമ്മം — ഉത്തരേന്ത്യൻ പഞ്ചകർമ്മത്തിൽ നിന്ന് എങ്ങനെ വ്യത്യാസപ്പെടുന്നു',
    seoTitle: 'Keraleeya vs North Indian Panchakarma — Tradition Differences',
    seoDescription: 'Keraleeya Panchakarma vs classical North Indian Panchakarma. Unique Kerala additions: Pizhichil, Njavarakizhi, Dhara. Monsoon timing rationale.',
    content: `"Panchakarma" classically means five — Vamana, Virechana, Basti, Nasya, Raktamokshana. But Kerala's actual therapeutic repertoire is much broader. This is what makes Keraleeya Panchakarma distinct.

## The Classical Five (Panchakarma proper)

These are documented in Charaka Samhita + Sushruta Samhita + Ashtanga Hridayam:

1. **Vamana** — controlled emesis; Kapha-Karma
2. **Virechana** — medicated purgation; Pitta-Karma
3. **Basti** — medicated enema; Vata-Karma
4. **Nasya** — medicated nasal drops; head + neck region
5. **Raktamokshana** — controlled bloodletting; specific indications

These five are practised in both Kerala and North India.

## Kerala's Additions

Kerala developed a parallel tradition of **bahya chikitsa** (external therapies) that are NOT in classical Panchakarma but are central to Kerala practice:

### Pizhichil (Sarvanga Dhara)
Continuous warm medicated oil bath. Two-therapist coordinated pouring + massage. 60-minute sessions. **Not described in Charaka or Sushruta.** Kerala lineage developed this. Gold standard for Vata + joint disorders.

### Njavarakizhi (Shashtika Shali Pinda Sweda)
Rice bolus fomentation using special 60-day Njavara rice. Cooked with milk + herbs. **Mentioned briefly in Sushruta but elaborated extensively in Kerala texts.** For muscle wasting, neurological recovery.

### Sirodhara
Continuous warm-oil stream over the forehead. **Specifically Kerala — Yogamrutam + Chikitsamanjari describe this in detail.** Iconic for stress, insomnia, anxiety.

### Other Kerala-specific therapies:
- **Takra Dhara** — buttermilk stream over forehead
- **Ksheera Dhara** — medicated milk stream
- **Pichu** — oil-soaked cotton pad on specific region
- **Murivenna application** — Kerala first-aid oil for sprains
- **Choornapinda Sweda** — powder bolus fomentation
- **Lepa** — therapeutic medicated paste application

## Why Monsoon (Karkidaka) is Preferred in Kerala

Classical Panchakarma in North India is preferred in autumn (Sharad — post-monsoon clearing). But Kerala Vaidyas developed Karkidaka Chikitsa for monsoon:

- Kerala's monsoon humidity opens body srotas (channels)
- Medicated oils absorb deeper
- Body's natural Vata aggravation makes Vata-pacifying therapies most effective
- Reduced sun exposure helps cooling Pitta protocols
- Cool ambient temperature supports lengthy oil applications

This is environment-specific Ayurveda — North India's drier climate doesn't favour monsoon Panchakarma the same way.

## North Indian Practice Differences

North Indian Panchakarma (typified by Rajasthan, Maharashtra, UP centres) tends to:
- Emphasise the classical 5 procedures more strictly
- Use Vamana more commonly (Kapha-dominant northern population)
- Stricter dietary protocols
- Shorter courses (often 7–14 days)
- Less emphasis on residential luxury (more clinical)
- Different oil preparations (more Tila Tailam base; less coconut)

## Kerala Practice Differences

Kerala Panchakarma tends to:
- **Expanded external therapies** dominate (Pizhichil, Njavarakizhi, Sirodhara)
- **Basti remains central** for Vata; Vamana used less than in North
- **Longer residential courses** (14–28 days standard)
- **Karkidaka seasonal preference** (mid-July to mid-August)
- **Coconut oil + sesame oil** combinations more common
- **Resort-format** centres common (medical tourism integration)

## Which Should You Choose?

**Choose North-Indian style if:**
- Time-constrained (1-week stay maximum)
- Severe Kapha-dominant pattern (e.g., chronic asthma where Vamana is the right Karma)
- Strong cultural preference

**Choose Kerala style if:**
- Vata-dominant disorders (arthritis, neurological, stress)
- Pitta disorders requiring Sirodhara
- 14+ days available
- Want the monsoon timing for therapeutic intensity
- Prefer residential format

The two traditions are complementary — not rival. Many senior Kerala Vaidyas trained in both traditions integrate freely.

## How AyurConnect Helps

For international + diaspora patients, AyurConnect's /heal-in-kerala guide helps plan Kerala-style residential Panchakarma — visa, costs in local currency, verified centres, doctor cross-check.` + DISC_EN,
  },
  {
    id: 'a3-24', slug: 'ashtavaidya-treatment-methods', language: 'en', categoryId: 'cat-classical', legacyCategory: 'heritage',
    title: 'Treatment Methods of the Ashtavaidyas',
    titleMl: 'അഷ്ടവൈദ്യന്മാരുടെ ചികിത്സാ രീതികൾ',
    seoTitle: 'Ashtavaidya Treatment Methods — Kerala\'s 8 Vaidya Families',
    seoDescription: 'How the 8 Ashtavaidya families practised differently. Specialisations, surviving institutions, lineage-based knowledge transfer.',
    content: `The Ashtavaidyas — the 8 hereditary Namboodiri physician families — represent the most distinctive tradition in Kerala Ayurveda. Their treatment methods differ from textbook Ayurveda in important ways.

## The 8 Families + Their Specialisations

Nambudiri P. & Paikkattu Purushothaman (2022, _JAIM_) profile this tradition through Pandit C K Vasudeva Sarma, illustrating their integrated approach:

**1. Pulamanthole Mooss (Palakkad district)** — Shalya (surgery) + Kayachikitsa
**2. Vaidyamadham (Perumbavur, Ernakulam)** — Prasuti Tantra (gynaecology) + Kayachikitsa
**3. Thaikkattu Mooss (Thiruvananthapuram)** — Shalakya (eye-ENT) + Kayachikitsa
**4. Alathur (Thrissur)** — Danta Chikitsa (dentistry) + Kayachikitsa
**5. Elayidath Tikkat (Thiruvananthapuram)** — Karmika Chikitsa (occupational) + Kayachikitsa
**6. Kuttamcherry (Thrissur)** — Shalya + Kayachikitsa
**7. Chirattaman (Pathanamthitta)** — Visha Chikitsa (toxicology)
**8. Thrakkanadi (Thrissur)** — Kayachikitsa (internal medicine)

## What Makes Their Practice Distinctive

### Integrated Approach
Unlike modern siloed specialty practice, Ashtavaidyas were generalists with one or two areas of deep expertise. A Pulamanthole physician would handle most conditions but refer surgical cases to himself; a Vaidyamadham physician would do the same with gynaecological cases.

### Diagnostic Tradition
Ashtavaidya Nadi Pariksha (pulse diagnosis) is among the most refined in Kerala. Senior physicians could distinguish dosha imbalance from a 30-second pulse read with high reproducibility.

### Family-Preserved Formulations
Each family maintained proprietary Kalpas (formulation lineages):
- Specific oil preparations
- Specific Choornam combinations
- Specific Lehyam recipes
- Sometimes using rare local herbs others didn't access

These were transmitted father-to-son under strict secrecy.

### Treatment-Diet Integration
Ashtavaidyas controlled patient diet completely during treatment. Residential patient stays were normal. Diet was changed daily based on treatment phase + dosha response — not a static plan.

### Spiritual + Ritual Layer
Treatment included Mantras + specific rituals integrated with herbal therapy. Modern practitioners often retain this — but transparent about it being adjunctive rather than primary therapeutic effect.

## Knowledge Transfer System

The Gurukula system was the heart:
- Apprentice trained in Vaidya's home from childhood
- Years of observation before independent practice
- Sanskrit fluency mandatory
- Comprehensive understanding of Charaka, Sushruta, Ashtanga Hridayam + family texts
- 12–20 years to full mastery

This is why Ashtavaidya knowledge has been so hard to systematise in modern BAMS curriculum — it requires temporal depth that 5.5 years cannot provide.

## Surviving Institutions

Several Ashtavaidya families still operate active clinics:

- **Pulamanthole Mooss family** — still actively practising; ancient compound preserved
- **Vaidyamadham** — runs clinical OPD; gynaecological specialty
- **Thaikkattu Mooss** — actively maintains classical pharmacy
- **Some Alathur lineage** practitioners visible

Verified directory listings on AyurConnect /doctors filter for "Ashtavaidya lineage" tag where verified.

## Modern Integration

Many current-generation Ashtavaidya descendants combine:
- Modern BAMS + MD-Ayurveda degrees
- Hereditary family knowledge
- Modern hospital practice (some run NABH-accredited clinics)

This hybrid is the future — preserving lineage knowledge while integrating with regulated modern Ayurvedic practice.

## What This Tradition Offers

For patients, choosing an Ashtavaidya-lineage practitioner offers:
- Access to family-preserved Kalpas not in standard pharmacies
- Diagnostic tradition refined over generations
- Treatment continuity (multi-visit, integrated)
- Cultural authenticity (for patients valuing this dimension)

It doesn't necessarily mean "better outcomes" than a well-trained BAMS + MD physician. Both have value. The Ashtavaidya tradition is **distinctive heritage** within Kerala Ayurveda — worth preserving + accessing as one option.

**Reference:** Nambudiri P, Paikkattu Purushothaman A. (2022). Pandit C K Vasudeva Sarma — A Profile of the Ashtavaidya Tradition. _Journal of Ayurveda and Integrative Medicine._` + DISC_EN,
  },
  {
    id: 'a3-25', slug: 'coconut-in-ayurveda-kerala', language: 'en', categoryId: 'cat-herbs', legacyCategory: 'guide',
    title: 'Coconut in Ayurveda — Kerala\'s Divine Medicine',
    titleMl: 'നാളികേരം ആയുർവേദത്തിൽ — കേരളത്തിന്റെ ദൈവീക ഔഷധം',
    seoTitle: 'Coconut Ayurveda — Narikela Medicinal Uses + Kerala Recipes',
    seoDescription: 'Narikela (coconut) in classical Kerala Ayurveda texts. Tender coconut water, coconut oil, coconut milk — medicinal uses + classical recipes.',
    content: `Narikela (coconut) holds a singular place in Kerala Ayurveda. From Sahasrayogam to daily kitchen practice, the coconut is treated as both food and medicine. Krishnakumar S. (2024, _Journal of Research in Ayurvedic Sciences_) documents the depth of this tradition.

## Classical Properties (Sahasrayogam)

- **Rasa** (taste): Madhura (sweet)
- **Guna** (quality): Guru (heavy), Sneha (unctuous)
- **Virya** (potency): Sheeta (cooling)
- **Vipaka** (post-digestive effect): Madhura
- **Dosha effect**: Vata-pacifying + Pitta-pacifying; can aggravate Kapha if overused

Different parts have distinct properties:
- **Tender coconut water (Karikadakam)**: Lightest, most cooling
- **Mature coconut flesh (Pakwa-narikela)**: Heavy, building, nourishing
- **Coconut oil (Narikela Tailam)**: Premier cooling oil for Pitta + Kapha
- **Coconut milk (Ksheera)**: Used in cooking + medicine vehicle
- **Coconut sugar (Narikela Guda)**: Mild Pitta-pacifier in moderation

## Medicinal Uses

### Tender Coconut Water
- **Daily Pitta cooling** — particularly in Grishma + Sharad
- **Dehydration** — natural electrolyte solution
- **Urinary disorders** — burning urination, cystitis
- **Hangover** — classical reference; modern validation
- **Fertility (female)** — daily during ovulation phase, mid-cycle
- **Pregnancy** — for hyperacidity, vomiting, electrolytes

### Coconut Oil
- **Daily Shiroabhyanga** — premier hair oil in Kerala (cooling, Pitta-pacifying)
- **Pakwa-narikela Tailam** — cooking oil with anti-inflammatory properties
- **Topical applications** — Neelibhringadi base, Eladi base, cosmetic Nalpamaradi base
- **Oral oil-pulling (Gandusha)** — daily morning practice; documented benefit on oral microbiome
- **Cooking medium** — MCT-based fat with rapid digestion

### Coconut Milk
- Postpartum nourishment recipes
- Vata-pacifying base for cooking
- Karkidaka Kanji ingredient
- Mild diuretic + Pitta cooling

## Classical Kerala Formulations Using Coconut

**Tila Mishrayoga Kashayam** (specific Kerala combinations) often use coconut milk vehicle.

**Pakwa-narikela Tailam** preparations:
- Eladi Tailam (cosmetic skin care)
- Nalpamaradi Tailam (pigmentation, acne marks)
- Pinda Tailam (Pitta arthritis)
- Neelibhringadi Tailam (hair fall — coconut base)

**Narikela Khanda** — coconut-based confection for postpartum + nutritive Rasayana.

## Modern Evidence

Coconut oil + MCT research shows:
- Rapid digestion (4–6 carbon fatty acids)
- Modest antimicrobial activity (lauric acid)
- Possible cognitive support in early Alzheimer's (very preliminary)
- **Saturated fat** — historical concern in cardiology, but recent meta-analyses show neutral-to-slightly-beneficial effect compared to refined oils

The "coconut oil bad for heart" message from 1990s nutrition guidelines has been substantially revised. Daily 1–2 tablespoons in cooking is generally considered safe-to-beneficial in non-hypercholesterolaemic populations.

## Practical Daily Use

**Cooking**: 1–2 tbsp coconut oil for sautéing; coconut milk in curries

**Hair**: 30-minute pre-bath coconut oil scalp massage, 3× weekly

**Hydration**: 1 tender coconut daily during summer; 3–4× weekly otherwise

**Oil pulling (Gandusha)**: 1 tbsp coconut oil swished in mouth for 10–20 minutes daily morning; spit (don't swallow); rinse + brush after

**Postpartum**: coconut milk-based Kanji + recipes (Karkidaka Kanji uses coconut milk)

## When to Be Cautious

- **Hypercholesterolaemia**: limit to <2 tbsp daily; prefer olive/mustard for cooking
- **Kapha excess + obesity**: limit coconut milk; tender coconut water OK
- **Diabetes**: coconut sugar in moderation only
- **Allergy to tree nuts**: cross-reactivity rare with coconut, but consult before use

## Cultural Note

In Kerala, coconut is so central it's reflected in proverbs, festivals, and household rituals. Every family has access to fresh coconut, coconut milk, coconut oil. This daily integration — not occasional supplement use — is what makes coconut work as Kerala's "divine medicine."

**Reference:** Krishnakumar S. (2024). Narikela in Kerala's Ayurvedic Tradition. _Journal of Research in Ayurvedic Sciences._` + DISC_EN,
  },
]

export async function seedArticlesV3Part2(prisma: PrismaClient): Promise<{ count: number }> {
  for (const a of BATCH) {
    const { id, slug, title, titleMl, content, language, categoryId, legacyCategory, seoTitle, seoDescription } = a
    const readTimeMinutes = Math.max(1, Math.round(content.split(/\s+/).length / 220))
    await prisma.knowledgeArticle.upsert({
      where:  { id },
      update: { slug, title, titleMl, content, language, categoryId, seoTitle, seoDescription, source: 'editorial', readTimeMinutes, status: 'published', category: legacyCategory },
      create: { id, slug, title, titleMl, content, language, categoryId, seoTitle, seoDescription, source: 'editorial', readTimeMinutes, status: 'published', category: legacyCategory },
    })
  }
  return { count: BATCH.length }
}
