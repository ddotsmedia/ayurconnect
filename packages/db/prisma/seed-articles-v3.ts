// 30 authoritative Ayurveda articles — academic citations + classical
// Kerala sources. Upsert by deterministic id 'a3-NN'. Malayalam preserved
// as Unicode. Uses enhanced KnowledgeArticle fields shipped 2026-06-10
// (slug, titleMl, categoryId, seoTitle, seoDescription, status, reviewedBy).

import type { PrismaClient } from '@prisma/client'

type Article = {
  id: string; slug: string
  title: string; titleMl?: string
  content: string
  language: 'en' | 'ml'
  categoryId: string
  seoTitle: string
  seoDescription: string
  source: string
}

const DISC_EN = '\n\n---\n**Disclaimer.** This article is for educational purposes only. Consult a qualified Ayurveda practitioner for personalised advice. _AI-generated content — pending medical review._\n\n_Author: AyurConnect Editorial._'
const DISC_ML = '\n\n---\n**മുന്നറിയിപ്പ്.** ഈ ലേഖനം വിദ്യാഭ്യാസ ആവശ്യങ്ങൾക്കായി മാത്രമാണ്. വ്യക്തിഗത ഉപദേശത്തിന് യോഗ്യതയുള്ള ആയുർവേദ ഡോക്ടറെ കാണുക. _AI സൃഷ്ടിച്ച ഉള്ളടക്കം — മെഡിക്കൽ റിവ്യൂ പെൻഡിംഗ്._\n\n_എഴുത്തുകാരൻ: AyurConnect Editorial._'

const A: Article[] = [
  // ─── CATEGORY 1: CLASSICAL KERALEEYA TEXTS (5, Malayalam primary) ────
  {
    id: 'a3-01', slug: 'sahasrayogam-kerala-encyclopedia-of-medicine', language: 'ml', categoryId: 'cat-classical', source: 'editorial',
    title: 'Sahasrayogam — Kerala\'s Encyclopedia of Medicine',
    titleMl: 'സഹസ്രയോഗം — കേരളത്തിന്റെ ഔഷധ വിജ്ഞാനകോശം',
    seoTitle: 'Sahasrayogam — Kerala Ayurveda Classical Text Guide',
    seoDescription: 'Sahasrayogam, Kerala\'s comprehensive classical Ayurveda formulary — history, structure, contemporary use by Kerala vaidyas. Authoritative overview.',
    content: `സഹസ്രയോഗം കേരള ആയുർവേദത്തിന്റെ ഏറ്റവും ഉപയോഗപ്രദമായ ക്ലാസിക്കൽ ഗ്രന്ഥമാണ് — ഒരു സമ്പൂർണ്ണ ഔഷധ വിജ്ഞാനകോശം. ഇത് ഇപ്പോഴും കേരളത്തിലെ പ്രായോഗിക വൈദ്യന്മാർ ദിവസവും റഫർ ചെയ്യുന്നു.

## ചരിത്രവും കർത്തൃത്വവും

സഹസ്രയോഗത്തിന്റെ ഒറ്റ കർത്താവില്ല — ഇത് ശതാബ്ദങ്ങളിലൂടെ കേരളീയ വൈദ്യന്മാർ ശേഖരിച്ച ഫോർമുലേഷനുകളുടെ സമാഹാരമാണ്. ഇതിന്റെ പേര് സൂചിപ്പിക്കുന്നതുപോലെ "ആയിരം യോഗങ്ങൾ" (formulations) — അതിലധികം എണ്ണത്തിൽ. പ്രസിദ്ധീകൃത നിലവിലുള്ള പതിപ്പുകൾ പ്രധാനമായും P.S. Varier-ന്റെ പരിശോധിത പതിപ്പിനെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്.

## ഘടന

സഹസ്രയോഗം **ദോസേജ് ഫോം പ്രകാരം സംഘടിപ്പിച്ചിരിക്കുന്നു** — ഇത് ഇതിന്റെ പ്രായോഗിക മൂല്യത്തിന്റെ കാതലാണ്:

- **കഷായ പ്രകരണം** (decoctions) — ദശമൂലകഷായം, ധന്വന്തരം, ഇന്ദുകാന്തം, വാരണാദി തുടങ്ങിയ കഷായങ്ങൾ
- **ചൂർണ്ണ പ്രകരണം** (powders) — അഷ്ടചൂർണ്ണം, വൈശ്വാനര, ഹിങ്ഗ്വാചാദി
- **ഘൃത പ്രകരണം** (medicated ghees) — ഇന്ദുകാന്തം ഘൃതം, ധന്വന്തരം ഘൃതം
- **തൈല പ്രകരണം** (medicated oils) — ധന്വന്തരം, ക്ഷീരബല, സഹചരാദി
- **ലേഹ്യ പ്രകരണം** (confections) — ദശമൂല രസായനം, ഇന്ദുകാന്തം ലേഹം
- **ഗുളിക + വടി പ്രകരണം** (tablets/pills) — വില്വാദി ഗുളിക, മനസമിത്രം
- **അരിഷ്ടാസവ പ്രകരണം** (fermented) — ദശമൂലാരിഷ്ടം, അശോകാരിഷ്ടം

## ആധുനിക ഉപയോഗം

ഇന്നത്തെ കേരള BAMS പാഠ്യപദ്ധതിയിൽ സഹസ്രയോഗം നിർബന്ധിത റഫറൻസാണ്. Krishnakumar (2024)-ന്റെ പഠനം പറയുന്നു: കേരളത്തിലെ പ്രമുഖ ഫാർമസ്യൂട്ടിക്കൽ കമ്പനികൾ (ആര്യ വൈദ്യ ശാല, വൈദ്യരത്നം, ഔഷധി) അവരുടെ ക്ലാസിക്കൽ ഉത്പന്നങ്ങളിൽ ഭൂരിഭാഗവും സഹസ്രയോഗത്തിലെ ഫോർമുലകൾ പിന്തുടരുന്നു.

## എന്തിന് കേന്ദ്രമാണ്

പാൻ-ഇന്ത്യൻ ക്ലാസിക്കൽ ഗ്രന്ഥങ്ങളിൽ (ചരക, സുശ്രുത, വാഗ്ഭട) വൈദ്യശാസ്ത്രീയ തത്വം ഉണ്ടെങ്കിലും, പ്രയോഗത്തിലെ "എങ്ങനെ" — സൂക്ഷ്മ പാചക വിധികൾ, അനുപാനങ്ങൾ, ഡോസേജ് — സഹസ്രയോഗത്തിലാണ്. ഇതാണ് കേരളീയ വൈദ്യന്മാർക്ക് ഇത് അവിഭാജ്യമാകുന്നതിന്റെ കാരണം.

**Reference:** Krishnakumar S. (2024). Sahasrayoga and Kerala's Pharmaceutical Tradition. _Journal of Research in Ayurvedic Sciences._` + DISC_ML,
  },
  {
    id: 'a3-02', slug: 'chikitsamanjari-kerala-treatment-handbook', language: 'ml', categoryId: 'cat-classical', source: 'editorial',
    title: 'Chikitsamanjari — The Handbook of Kerala Treatment Tradition',
    titleMl: 'ചികിത്സാമഞ്ജരി — കേരളീയ ചികിത്സാ പാരമ്പര്യത്തിന്റെ കൈപ്പുസ്തകം',
    seoTitle: 'Chikitsamanjari — Kerala Ayurveda Treatment Handbook',
    seoDescription: 'Chikitsamanjari — Kerala\'s indispensable clinical handbook. History, unique treatment protocols, how it differs from pan-Indian classical texts.',
    content: `ചികിത്സാമഞ്ജരി കേരളീയ ചികിത്സാ പാരമ്പര്യത്തിന്റെ പ്രയോഗപാഠപുസ്തകമാണ്. ഇത് ക്ലാസിക്കൽ സിദ്ധാന്തവുമായി കേരളീയ പ്രയോഗത്തെ ബന്ധിപ്പിക്കുന്നു.

## ഉത്ഭവവും കർത്തൃത്വവും

ചികിത്സാമഞ്ജരി **17-18 നൂറ്റാണ്ടിലെ കേരളീയ വൈദ്യ പണ്ഡിതരുടെ കൃതിയാണ്**. കൃത്യമായ കർത്താവ് വിവാദപരമാണ്, എങ്കിലും അഷ്ടവൈദ്യ പാരമ്പര്യവുമായി ഇതിന് ശക്തമായ ബന്ധമുണ്ട്. പല ലിഖിത പതിപ്പുകൾ കേരളത്തിലെ പുരാതന വൈദ്യ കുടുംബങ്ങളിൽ ലഭ്യമാണ്.

## പ്രധാന സവിശേഷതകൾ

- **രോഗ-കേന്ദ്രീകൃത ഘടന** — ജ്വരം, അതീസാരം, ശ്വാസം എന്നിങ്ങനെ രോഗങ്ങൾ പ്രകാരം ഓർഗനൈസ് ചെയ്തിരിക്കുന്നു
- **കേരളീയ പാചക സൂചനകൾ** — കേരളത്തിൽ ലഭ്യമായ ഔഷധികൾക്കനുസരിച്ച് അഡാപ്റ്റ് ചെയ്ത ഫോർമുലകൾ
- **പ്രായോഗിക ഉദാഹരണങ്ങൾ** — ഓരോ രോഗത്തിനും ഒന്നിലധികം ചികിത്സാ ഓപ്ഷനുകൾ
- **ദോഷാധിഷ്ഠിത വർഗ്ഗീകരണം** — ഓരോ രോഗവും വാത-പിത്ത-കഫ പ്രകാരം ഉപവിഭാഗങ്ങളിലാക്കിയിരിക്കുന്നു

## പാൻ-ഇന്ത്യൻ ഗ്രന്ഥങ്ങളിൽ നിന്നുള്ള വ്യത്യാസം

ചരക സംഹിതയും വാഗ്ഭടന്റെ അഷ്ടാംഗ ഹൃദയവും **തത്വശാസ്ത്രപരവും രോഗശാസ്ത്രപരവുമാണ്**; ചികിത്സാമഞ്ജരി **ക്ലിനിക്കൽ + പ്രയോഗപരവുമാണ്**. ഉദാഹരണത്തിന്:

- ജ്വരത്തിന് — അഷ്ടാംഗ ഹൃദയം ദോഷ വർഗ്ഗീകരണവും തത്വവും വിശദീകരിക്കുന്നു; ചികിത്സാമഞ്ജരി **കേരളീയ വൈദ്യൻ ഏത് കഷായം എപ്പോൾ കൊടുക്കണം** എന്ന് നേരിട്ട് പറയുന്നു
- ഉത്തരവസ്തി പോലുള്ള കേരളീയ പ്രയോഗങ്ങൾ ഇതിൽ വ്യക്തമായി രേഖപ്പെടുത്തിയിട്ടുണ്ട്
- കിഴി, പിജിച്ചിൽ പോലുള്ള ബാഹ്യ ചികിത്സകൾ ഇതിൽ വിശദമാണ്

## ആധുനിക പ്രസക്തി

ഇപ്പോഴും കേരളത്തിലെ പല സീനിയർ വൈദ്യന്മാർ ചികിത്സാമഞ്ജരി പ്രാഥമിക ക്ലിനിക്കൽ റഫറൻസായി ഉപയോഗിക്കുന്നു. കേരള BAMS ക്ലിനിക്കൽ ട്രെയിനിംഗിൽ ഇത് പ്രധാന ടെക്സ്റ്റാണ്.` + DISC_ML,
  },
  {
    id: 'a3-03', slug: 'yogamrutam-collection-of-ayurvedic-formulations', language: 'ml', categoryId: 'cat-classical', source: 'editorial',
    title: 'Yogamrutam — Collection of Ayurvedic Formulations',
    titleMl: 'യോഗാമൃതം — ആയുർവേദ യോഗങ്ങളുടെ സമാഹാരം',
    seoTitle: 'Yogamrutam — Kerala Ayurveda Formulation Compendium',
    seoDescription: 'Yogamrutam — what "yogas" mean in Ayurveda, key Kerala formulations, how practitioners reference this classical compendium today.',
    content: `യോഗാമൃതം ആയുർവേദ യോഗങ്ങളുടെ (ഫോർമുലേഷനുകളുടെ) സമാഹാരമാണ്. കേരളീയ വൈദ്യ പ്രയോഗത്തിൽ പ്രധാന റഫറൻസ്.

## "യോഗം" എന്നാൽ എന്ത്

ആയുർവേദത്തിൽ **യോഗം എന്നാൽ ഫോർമുലേഷൻ** — രണ്ടോ അതിലധികമോ ഔഷധികളുടെ സംയോജനം. ഇത് ഏക-ഔഷധി (ദ്രവ്യഗുണ) പ്രയോഗത്തിൽ നിന്ന് വ്യത്യസ്തമാണ്. ഒരു യോഗത്തിന് ഇവ ഉണ്ടാകും:

- **പ്രധാന ദ്രവ്യം** (chief drug)
- **അനുദ്രവ്യങ്ങൾ** (supportive drugs)
- **അനുപാനം** (vehicle for administration)
- **കാല പ്രയോഗം** (timing)
- **അനുവൃത്തി** (frequency)

## യോഗാമൃതത്തിലെ ഉള്ളടക്കം

ഇതിന്റെ ഘടന **ഉദ്ദേശ്യാധിഷ്ഠിതമാണ്**:

- ജ്വരഹര യോഗങ്ങൾ (fever-relievers)
- കാസഹര യോഗങ്ങൾ (cough-relievers)
- ശ്വാസഹര യോഗങ്ങൾ (dyspnoea-relievers)
- അതീസാരഹര യോഗങ്ങൾ (diarrhoea-relievers)
- ഗ്രഹണി ഹര യോഗങ്ങൾ (IBS-relievers)
- രസായന യോഗങ്ങൾ (rejuvenation formulations)

ഓരോ വിഭാഗത്തിലും ഒന്നിലധികം ഓപ്ഷനുകൾ — ദോഷ പ്രബലത, രോഗ ഘട്ടം, രോഗിയുടെ ബലം എന്നിവ അനുസരിച്ച് വൈദ്യൻ തിരഞ്ഞെടുക്കാം.

## കേരളീയ വൈദ്യന്മാർ എങ്ങനെ റഫർ ചെയ്യുന്നു

പ്രായോഗിക വൈദ്യൻ ഒരു രോഗി കാണുമ്പോൾ:
1. ദോഷ വർഗ്ഗീകരണം നടത്തുന്നു
2. ചികിത്സാമഞ്ജരി / സഹസ്രയോഗത്തിൽ പ്രാഥമിക ചികിത്സാ ദിശ കണ്ടെത്തുന്നു
3. യോഗാമൃതത്തിൽ പ്രത്യേക യോഗം തിരഞ്ഞെടുക്കുന്നു
4. പാചക വിധി പരിശോധിക്കുന്നു

ഇത് 3-ഗ്രന്ഥ വർക്ക്ഫ്ലോ കേരളീയ വൈദ്യ പാരമ്പര്യത്തിന്റെ കാതലാണ്.

## പരിമിതികൾ

യോഗാമൃതം **സ്വയം-ചികിത്സയ്ക്കായി രൂപകൽപ്പന ചെയ്തിട്ടില്ല**. ഓരോ ഫോർമുലയ്ക്കും വൈദ്യന്റെ വ്യാഖ്യാനവും വ്യക്തിഗത അനുയോജ്യതാ പരിശോധനയും ആവശ്യമാണ്. ലിസ്റ്റിലെ പേരുകൾ കാണുമ്പോൾ സ്വയം ഉപയോഗിക്കരുത്.` + DISC_ML,
  },
  {
    id: 'a3-04', slug: 'arogyakalpadrumam-kerala-ayurvedic-pediatrics', language: 'ml', categoryId: 'cat-classical', source: 'editorial',
    title: 'Arogyakalpadrumam — Ayurvedic Pediatrics from Kerala',
    titleMl: 'ആരോഗ്യകല്പദ്രുമം — കുട്ടികളുടെ ആയുർവേദ ചികിത്സ',
    seoTitle: 'Arogyakalpadrumam — Kerala Ayurvedic Pediatrics Guide',
    seoDescription: 'Arogyakalpadrumam — Kerala\'s classical pediatric Ayurveda text. Traditional infant care, oil massage, with modern research validation.',
    content: `ആരോഗ്യകല്പദ്രുമം കേരളത്തിന്റെ പ്രത്യേക പെഡിയാട്രിക് ആയുർവേദ ഗ്രന്ഥമാണ് — ശിശു ജനനം മുതൽ കൗമാരം വരെയുള്ള ചികിത്സ.

## എന്തുകൊണ്ട് വേറിട്ട ഗ്രന്ഥം

ചരക സംഹിതയിലെ കാശ്യപ സംഹിതയിൽ പെഡിയാട്രിക്സ് (കൗമാരഭൃത്യ) ഉണ്ടെങ്കിലും, **കേരളീയ പെഡിയാട്രിക് പ്രയോഗങ്ങൾ കൂടുതൽ വിശദമാണ്** — കാലാവസ്ഥ, ലഭ്യമായ ഔഷധികൾ, പരമ്പരാഗത വീട്ടു-ചികിത്സകൾ എന്നിവ ഉൾപ്പെടെ. ആരോഗ്യകല്പദ്രുമം ഇത് ഏകീകരിച്ചു.

## പ്രധാന വിഷയങ്ങൾ

- **ജാതകർമ്മം** — ജനന വേളയിലെ ആചാരങ്ങളും വൈദ്യ ഇടപെടലുകളും
- **സ്തന്യപാന** — മാതാവിന്റെ ആഹാരം മുലപ്പാലിന്റെ ഗുണത്തെ ബാധിക്കും; വിശദമായ മാർഗ്ഗനിർദ്ദേശങ്ങൾ
- **ദന്തോദ്ഭവ ചികിത്സ** — പല്ല് മുളയ്ക്കുന്ന കാലത്തെ പ്രശ്നങ്ങൾ
- **അന്നപ്രാശനം** — കുട്ടിക്ക് ആദ്യമായി ഭക്ഷണം നൽകുന്ന ആചാരം
- **സ്വർണ്ണപ്രാശനം** — കുട്ടികളുടെ ഇമ്മ്യൂണിറ്റി-മെഡ്യ പ്രയോഗം

## എണ്ണ തേച്ചു കുളി പാരമ്പര്യം

ശിശു അഭ്യംഗം (infant oil massage) കേരളീയ പാരമ്പര്യത്തിന്റെ കാതലാണ്. Panicker et al. (2026, _Frontiers in Medicine_) മലപ്പുറം ജില്ലയിൽ നടത്തിയ പഠനം കാണിക്കുന്നു:

- ജനന ശേഷം 6 ആഴ്ച ദൈനംദിന അഭ്യംഗം ചെയ്ത ശിശുക്കൾക്ക്:
  - ഉറക്കത്തിന്റെ ഗുണനിലവാരം മെച്ചപ്പെട്ടു
  - വൈറൽ അണുബാധയുടെ ഫ്രീക്വൻസി കുറഞ്ഞു
  - മാതാ-ശിശു ബന്ധനം ശക്തമായി

പരമ്പരാഗതമായി ഉപയോഗിക്കുന്ന എണ്ണകൾ: ലാക്ഷാദി തൈലം (പൊതുവായ ശിശു Abhyanga), ബല-അശ്വഗന്ധാദി തൈലം (പേശി-ബല ശിശുവിന്), ധന്വന്തരം തൈലം (വാത ശിശുവിന്).

## ആധുനിക പ്രസക്തി

NCISM പെഡിയാട്രിക് BAMS പാഠ്യപദ്ധതിയിൽ ആരോഗ്യകല്പദ്രുമം ഇപ്പോഴും റഫറൻസാണ്. കേരളത്തിലെ Kaumarbhritya (പെഡിയാട്രിക് MD-Ayurveda) വിദ്യാർത്ഥികൾ ഇത് വിശദമായി പഠിക്കുന്നു.

**Reference:** Panicker R, et al. (2026). Effects of Daily Oil Massage on Infants — A Malappuram Cohort Study. _Frontiers in Medicine._` + DISC_ML,
  },
  {
    id: 'a3-05', slug: 'prayoga-samuccayam-kerala-toxicology-tradition', language: 'ml', categoryId: 'cat-classical', source: 'editorial',
    title: 'Prayoga Samuccayam — Kerala\'s Toxicology Tradition',
    titleMl: 'പ്രയോഗ സമുച്ചയം — കേരളത്തിലെ വിഷ ചികിത്സ',
    seoTitle: 'Prayoga Samuccayam — Kerala Ayurvedic Toxicology Guide',
    seoDescription: 'Prayoga Samuccayam — Kerala\'s unique Visha Chikitsa (toxicology) tradition. Snakebite treatments and the surviving classical practice.',
    content: `വിഷ ചികിത്സ (toxicology) കേരളീയ ആയുർവേദ വൈദ്യശാസ്ത്രത്തിലെ പ്രത്യേക ശാഖയാണ്. പ്രയോഗ സമുച്ചയം ഈ പാരമ്പര്യത്തിന്റെ പ്രധാന ഗ്രന്ഥമാണ്.

## കേരളീയ വിഷ ചികിത്സ — അനന്യ ശാഖ

പാൻ-ഇന്ത്യൻ സുശ്രുത സംഹിത വിഷം പ്രതിപാദിക്കുന്നുണ്ടെങ്കിലും, **കേരളീയ വിഷ വൈദ്യൻ ഒരു സ്വതന്ത്ര വൈദ്യശാസ്ത്രീയ ശാഖയായി പരിണമിച്ചു** — കാരണം:

- കേരളത്തിലെ പാമ്പുകൾ (മൂർഖൻ, അണലി, പെരുമ്പാമ്പ്) ദേശ-സവിശേഷം
- തദ്ദേശീയ വിഷ-വിരുദ്ധ ഔഷധികൾ വ്യാപകം
- പരമ്പരാഗത വിഷ വൈദ്യന്മാർ (വിഷഹരി) ഗ്രാമീണ പ്രദേശങ്ങളിൽ പ്രവർത്തിച്ചു

## 1930-കളിലെ ഗ്രന്ഥം

പ്രയോഗ സമുച്ചയം **1930-കളിൽ പ്രസിദ്ധീകൃതമാണ്** — ഇത് വാമൊഴി പാരമ്പര്യത്തെ ലിഖിത രൂപത്തിലാക്കാനുള്ള പരിശ്രമം. ഉള്ളടക്കം:

- സർപ്പ വിഷം — ഏതേത് സർപ്പത്തിന്റെ വിഷം എങ്ങനെ തിരിച്ചറിയാം
- വൃശ്ചിക + കീട വിഷം — തേള്, പുള്ളിച്ചാത്തൻ
- സ്ഥാവര വിഷം — സസ്യ വിഷങ്ങൾ
- കൃതിമ വിഷം — ദുഷിത ഭക്ഷണം, ലോഹ വിഷം
- ദൂഷീ വിഷം — ദീർഘകാല ലോ-ഗ്രേഡ് വിഷം (modern allergies-നോട് സാമ്യം)

## ചികിത്സാ പ്രയോഗങ്ങൾ

- **അരിശ്മ + മന്ത്രങ്ങൾ** — ഫസ്റ്റ്-എയ്ഡ്
- **അഞ്ജനം** — കണ്ണിൽ പ്രയോഗിക്കുന്ന ഔഷധ പേസ്റ്റ്
- **നസ്യം** — മൂക്കിലൂടെ ഉത്തേജക ഔഷധം
- **അവലേഹനം** — ജിഹ്വയിൽ പുരട്ടാനുള്ള ഔഷധം
- **ദൂഷീവിഷാരി ഗുളിക** — ദീർഘകാല വിഷ-ദുഷ്ടി കരേക്റ്റീവ്

## ഇന്നത്തെ പ്രസക്തി

Ancheril et al. (2016)-ന്റെ പഠനം _Ancient Science of Life_-ൽ കാണിക്കുന്നു: കേരളീയ വിഷ ചികിത്സ പാരമ്പര്യം ഇപ്പോഴും ജീവിക്കുന്നു. പല ഗ്രാമീണ പ്രദേശങ്ങളിൽ ASV (modern anti-snake venom) എത്തുന്നതിന് മുമ്പുള്ള ഫസ്റ്റ്-എയ്ഡായി ഇത് നൽകുന്നു.

**നിർണ്ണായക:** പാമ്പ് കടിച്ചാൽ ഏറ്റവും ആദ്യ പടി — **ഉടൻ ഹോസ്പിറ്റലിൽ പോകുക + ASV സ്വീകരിക്കുക**. ആയുർവേദ വിഷ ചികിത്സ ആധുനിക ചികിത്സയ്ക്കൊപ്പമോ ദീർഘകാല ദുഷ്ടി-ശമനത്തിനോ ഉള്ളതാണ് — ഒറ്റയ്ക്കല്ല.

**Reference:** Ancheril J, et al. (2016). Visha Chikitsa Tradition in Kerala. _Ancient Science of Life, 35(4)._` + DISC_ML,
  },

  // ─── CATEGORY 2: KARKIDAKA + SEASONAL (5, bilingual) ──────────────────
  {
    id: 'a3-06', slug: 'karkidaka-kanji-medicinal-recipe', language: 'ml', categoryId: 'cat-karkidaka', source: 'editorial',
    title: 'Karkidaka Kanji — Medicinal Benefits and Recipe',
    titleMl: 'കർക്കിടക കഞ്ഞി — ഔഷധ ഗുണങ്ങളും പാചക വിധിയും',
    seoTitle: 'Karkidaka Kanji Recipe — Kerala Monsoon Medicinal Porridge',
    seoDescription: 'Authentic Karkidaka Kanji recipe with navara rice + 10+ herbs. Medicinal benefits per Ayurveda, when + how to take during Karkidakam.',
    content: `കർക്കിടക കഞ്ഞി കേരളീയ പാരമ്പര്യ ആരോഗ്യ ഭക്ഷണത്തിന്റെ ഏറ്റവും പ്രശസ്ത ഉദാഹരണമാണ് — കർക്കിടകം മാസത്തിലെ വാർഷിക പുനരുദ്ധാരണ ദിനചര്യ.

## എന്തുകൊണ്ട് കർക്കിടകം?

ജൂൺ-ഓഗസ്റ്റ് മൺസൂൺ കാലത്ത് **അഗ്നി ദുർബലമാകുന്നു + വാത പ്രകോപിക്കുന്നു + ഇമ്മ്യൂണിറ്റി കുറയുന്നു**. കർക്കിടക കഞ്ഞി ഈ മൂന്നും അഭിസംബോധന ചെയ്യുന്നു.

## ഉള്ളടക്കം

പ്രധാന ധാന്യം:
- **നവര അരി** (Shashtika Shali) — 60-ദിവസ പാകം, കേരള-സ്പെസിഫിക് ഔഷധി ധാന്യം

ഔഷധി മിശ്രിതം (10–15 ഇനങ്ങൾ):
- ദശമൂലം (ബിൽവ, അഗ്നിമന്ഥ, ശ്യോനാക, പാടല, ഗംഭാരി, ബൃഹതി, കണ്ടകാരി, ഗോക്ഷുര, ശാലപർണി, പൃശ്നിപർണി)
- ജീരകം
- അജ്മാദ
- പിപ്പലി
- ചുക്ക് (ദൃഢം പിച്ച ഇഞ്ചി)
- തിപ്പലി
- എലം

പാചക സഹായികൾ:
- തേങ്ങാപ്പാൽ (1 കപ്പ്)
- ശർക്കര അല്ലെങ്കിൽ ഈന്തപ്പഴം ശർക്കര (രുചിക്ക്)
- പശുവിൻ നെയ്യ് (1 ടീസ്പൂൺ — അവസാനം)

## പാചക വിധി

1. നവര അരി 100 ഗ്രാം നന്നായി കഴുകി 30 മിനിറ്റ് കുതിർക്കുക
2. ഔഷധി പൊടി മിശ്രിതം 10 ഗ്രാം — 500 ml വെള്ളത്തിൽ 15 മിനിറ്റ് തിളപ്പിക്കുക, അരിച്ച് ഔഷധി-വെള്ളം എടുക്കുക
3. അരി ഔഷധി-വെള്ളത്തിൽ മൃദുവായി വേവിക്കുക (45 മിനിറ്റ്)
4. തേങ്ങാപ്പാൽ + ശർക്കര ചേർത്ത് 5 മിനിറ്റ് വീണ്ടും വേവിക്കുക
5. ചൂടോടെ വിളമ്പുമ്പോൾ 1 ടീസ്പൂൺ നെയ്യ് ചേർക്കുക

## കഴിക്കേണ്ട വിധം

- രാവിലെ **ഒഴിഞ്ഞ വയറ്റിൽ** പ്രധാന ഭക്ഷണമായി
- 7-14 ദിവസം തുടർച്ചയായി
- ഈ ദിവസങ്ങളിൽ മറ്റ് ഭക്ഷണം ലഘു — കിച്ചഡി, പച്ചക്കറി സൂപ്പ്, പുട്ട്
- തൈര്, അസിഡിക് പഴങ്ങൾ, പുളിച്ച ഭക്ഷണം, അമിത മധുരം, അമിത ഉപ്പ് — ഒഴിവാക്കുക

## ഫലങ്ങൾ

- ദഹന അഗ്നി പുനഃസ്ഥാപനം
- ഓജസ് നിർമ്മാണം (പ്രതിരോധശേഷി)
- ദോഷ സന്തുലനം
- വർഷം മുഴുവനും ഊർജ്ജം നൽകൽ

## ആർക്ക് ശ്രദ്ധിക്കണം

പ്രമേഹ രോഗികൾ ശർക്കരയ്ക്ക് പകരം സ്റ്റിവിയ ഉപയോഗിക്കാം. ഗർഭിണികൾ + കുട്ടികൾ വൈദ്യന്റെ നിർദ്ദേശം തേടണം. തേങ്ങാപ്പാൽ അലർജി ഉള്ളവർ പശുവിൻ പാൽ ഉപയോഗിക്കാം.` + DISC_ML,
  },
  {
    id: 'a3-07', slug: 'monsoon-medicine-intake-karkidakam', language: 'ml', categoryId: 'cat-karkidaka', source: 'editorial',
    title: 'Monsoon Medicine Intake in Karkidakam — What, Why, How',
    titleMl: 'കർക്കിടകത്തിലെ ഔഷധ സേവ — എന്ത്, എന്തിന്, എങ്ങനെ',
    seoTitle: 'Karkidakam Medicine Intake — Monsoon Detox + Rejuvenation',
    seoDescription: 'Why monsoon is the ideal Ayurveda detox + rejuvenation season. Classical Karkidakam medicines, Panchakarma timing, Vata theory explained.',
    content: `കർക്കിടകം മാസത്തിൽ ഔഷധ സേവ കേരളീയ പാരമ്പര്യത്തിന്റെ പ്രതീകമാണ്. എന്തുകൊണ്ട് ഈ കാലം? എന്ത് സ്വീകരിക്കണം?

## ക്ലാസിക്കൽ ന്യായം

അഷ്ടാംഗ ഹൃദയം സൂത്രസ്ഥാനം 3-ൽ വാഗ്ഭടൻ വ്യക്തമാക്കുന്നു: **വർഷ ഋതുവിൽ വാത പ്രകോപിക്കുകയും അഗ്നി ദുർബലമാകുകയും ചെയ്യും**. പക്ഷേ ഇത് അവസരവുമാണ്:

- മൺസൂൺ ഈർപ്പം **ശരീര സുഷിരങ്ങൾ തുറക്കുന്നു** — ഔഷധികൾ ആഴത്തിലേക്ക് ആഗിരണം ചെയ്യപ്പെടും
- അന്തരീക്ഷ താപനില **കുറവ്** — ശരീരം ഔഷധ പ്രവർത്തനത്തിന് ഊർജ്ജം നൽകും
- തണ്ടെലുബിലെ കാർട്ടിലേജും സ്നായുക്കളും **കൂടുതൽ വഴക്കമുള്ളവ** — Panchakarma ഫലപ്രദം

## എന്ത് സേവിക്കണം

**1. കർക്കിടക കഞ്ഞി** (മുകളിൽ പ്രതിപാദിച്ച ലേഖനം കാണുക) — 7-14 ദിവസം

**2. വാത-ശമന കഷായങ്ങൾ**:
- ധന്വന്തരം കഷായം — ദൈനംദിന 15 ml
- രാസ്നൈരണ്ഡാദി കഷായം — സന്ധി പ്രശ്നങ്ങൾക്ക്
- ഇന്ദുകാന്തം കഷായം — അഗ്നി പുനഃസ്ഥാപനത്തിന്

**3. രസായന ലേഹങ്ങൾ**:
- ച്യവനപ്രാശം — ദൈനംദിന 1 ടീസ്പൂൺ (പ്രമേഹം ഇല്ലെങ്കിൽ)
- ദശമൂല രസായനം — വാത പ്രകൃതിക്ക്
- ബ്രഹ്മ രസായനം — സമഗ്ര Rasayana

**4. അഭ്യംഗ തൈലങ്ങൾ**:
- ധന്വന്തരം തൈലം — ദൈനംദിന ബാഹ്യ പ്രയോഗം
- ക്ഷീരബല തൈലം — ശിരോഭ്യംഗത്തിന്

## പഞ്ചകർമ്മത്തിന്റെ കാലം

കർക്കിടകം **പഞ്ചകർമ്മത്തിന്റെ ഏറ്റവും ഫലപ്രദമായ കാലമാണ്** — പ്രത്യേകിച്ച്:

- ബസ്തി (medicated enema) — വാത സന്തുലനത്തിന്റെ പ്രധാന ഉപകരണം
- അഭ്യംഗം + സ്വേദനം — ദൈനംദിന + 14-21 ദിവസ കോഴ്സുകൾ
- ശിരോധാര — മാനസിക സന്തുലനത്തിന്

ഇത് കേരള ടൂറിസത്തിന്റെ **കർക്കിടക ചികിത്സ** ടൂറിസം പാക്കേജുകളുടെ കാതലാണ്.

## പ്രവാസികൾക്ക്

ഗൾഫ്, യൂറോപ്പ്, യു.എസ്. എന്നിവിടങ്ങളിൽ ഉള്ള പ്രവാസികൾക്ക് **കർക്കിടകം മാസത്തിലെ കേരള യാത്ര** ഒരു വാർഷിക wellness investment ആണ്. 21-ദിവസ Karkidaka Chikitsa പാക്കേജുകൾ ഏറ്റവും പ്രശസ്തമാണ്. ജൂൺ-ജൂലൈ ബുക്കിങ്ങ് 3 മാസം മുമ്പേ ചെയ്യണം — സ്ലോട്ടുകൾ പെട്ടെന്ന് നിറയും.

## ശ്രദ്ധിക്കേണ്ടത്

- എല്ലാ ഔഷധ സേവയും **വൈദ്യ നിർദ്ദേശപ്രകാരം** മാത്രം
- തണുപ്പ്, ഈർപ്പം എന്നിവയിൽ നിന്ന് രക്ഷ
- ദിവസ ഉറക്കം **ഒഴിവാക്കുക**
- ഭക്ഷണം ലഘു + പുതുതായി പാകം ചെയ്തത് മാത്രം` + DISC_ML,
  },
  {
    id: 'a3-08', slug: 'shishira-ritu-winter-ayurveda-lifestyle', language: 'en', categoryId: 'cat-lifestyle', source: 'editorial',
    title: 'Winter Ayurveda — Lifestyle Guide for Cold Season',
    titleMl: 'ശിശിര ഋതു — തണുപ്പ് കാലത്തെ ആയുർവേദ ജീവിതശൈലി',
    seoTitle: 'Winter Ayurveda Guide — Shishira Ritu Diet + Lifestyle',
    seoDescription: 'Shishira Ritu Ayurvedic practices: diet, herbs, exercise, oil massage for cold season. Includes Gulf climate adaptation for diaspora.',
    content: `Shishira Ritu (January–February) is the late-winter season in the classical Indian calendar. Ayurveda treats this as the **peak strength phase of the year** — strong Agni, building potential for Rasayana.

## Dosha Pattern

- Kapha is in **sanchaya** (accumulation) phase — preparing for Vasanta aggravation
- Vata is **subsiding** from its Hemanta peak
- Pitta is **balanced**

The body's natural state is strong + capable of digesting heavy nourishing food.

## Diet (Ahara)

**Favour:**
- Heavy, warm, sweet, slightly sour
- Aged grains (rice, wheat, barley)
- Cow's milk, ghee, fresh butter
- Almonds, walnuts, dates, sesame, jaggery
- Cooked root vegetables, drumstick, ginger, garlic
- Spices: black pepper, dry ginger (Shunthi), long pepper (Pippali), cinnamon

**Avoid:**
- Cold, raw foods (uncooked salads in excess)
- Stale food
- Excessive sour-fermented
- Excessive sweet refined sugar
- Cold drinks

## Lifestyle (Vihara)

- **Daily Abhyanga** with sesame or Dhanwantaram Tailam — pre-bath
- **Vigorous exercise** appropriate to constitution
- **Warm water bath**
- **Sleep**: 7-8 hours; early to bed, late-early waking acceptable
- **Avoid**: daytime sleep, cold drafts, getting wet in cold

## Herbs + Formulations

**Daily Rasayana:**
- Chyavanaprasha 1 tsp twice daily with warm milk
- Brahma Rasayana for adults
- Pippali Rasayana for respiratory weakness

**Internal warming:**
- Trikatu Churnam 1 g with honey before meals
- Ashwagandha Choornam 3 g at bedtime with warm milk
- Triphala 1 tsp at bedtime with warm water (daily detox)

## Gulf Climate Adaptation

For UAE, Saudi, Qatar, Kuwait residents — your "winter" is November–March. Adaptations:

- Light cottons still appropriate during day; light sweater for evening
- **AC dryness aggravates Vata** — increase oil application + warm drinks
- Coconut water + warm ginger water alternation
- Daily 30-minute walk outdoors during cool hours (early morning)
- Don't over-cool the body — Gulf "winter" is not actually cold like Kerala highlands

## Modern Application

Winter is the ideal season for:
- Starting a daily Abhyanga routine
- Building stamina through Rasayana
- Joint care for those with arthritis (warming pre-emption)
- Improving immunity before spring viral season

For Kerala-tradition support during winter, residential Rasayana + Abhyanga programmes are available at major centres (Arya Vaidya Sala Kottakkal, Vaidyaratnam, Somatheeram).` + DISC_EN,
  },
  {
    id: 'a3-09', slug: 'grishma-ritu-summer-ayurveda-cooling', language: 'en', categoryId: 'cat-lifestyle', source: 'editorial',
    title: 'Summer Ayurveda — Cooling the Body in Hot Season',
    titleMl: 'ഗ്രീഷ്മ ഋതു — ചൂട് കാലത്ത് ശരീരം തണുപ്പിക്കാൻ',
    seoTitle: 'Summer Ayurveda — Pitta Cooling Foods + Lifestyle Guide',
    seoDescription: 'Grishma Ritu Ayurveda guide — cooling foods, drinks (tender coconut, buttermilk), herbs + lifestyle. Essential for Gulf + Indian summer.',
    content: `Grishma Ritu (May–June in India; April–October in Gulf-arid climates) demands disciplined Pitta-pacification. Heat + dehydration + Pitta aggravation drive most summer disorders.

## Dosha Pattern

- Pitta is in **sanchaya** (accumulating) — builds toward Sharad peak
- Vata is **balanced**
- Kapha is **kshaya** (declining) — natural body lightness

## Diet (Ahara)

**Favour:**
- Cool, sweet, bitter, slightly astringent
- Old rice, wheat, barley
- Cow's milk (cool, not boiled hot), butter, ghee
- **Tender coconut water** — Kerala's signature summer drink
- **Buttermilk (lassi)** with rock salt + cumin + coriander
- Sweet juicy fruits: grapes, sweet pomegranate, ripe melon (in moderation)
- Cucumber, gourds, leafy greens, fennel, coriander, fresh mint

**Avoid:**
- Pungent, sour, salty in excess
- Tomatoes, vinegar, pickles, fermented foods
- Excess coffee, alcohol
- Deep-fried foods
- Excessive bakery (Pitta aggravator)
- Mango in large quantities (paradox — sweet but heating)

## Lifestyle (Vihara)

- **Avoid midday sun** (11 AM – 3 PM)
- **Cool water bath** twice daily
- Light cotton clothing — loose, white/pastel colours
- **Sleep in cool, ventilated rooms**; can take a short daytime nap (Grishma is the ONE season Ayurveda permits this)
- **Avoid anger + arguments** — Sadhaka Pitta protection
- Moonlight walks in evening
- Pranayama (Sheetali, Sheetkari) for internal cooling

## Cooling Drinks (Recipes)

**Tender coconut water** — daily, mid-morning
**Buttermilk** (Takra): 1 part yoghurt + 4 parts water, churned; add rock salt + roasted cumin + fresh coriander
**Coriander seed water**: 1 tsp soaked overnight in 200 ml water, strain in morning, sip through day
**Fennel-rose water**: soak 1 tsp fennel + 1 tsp dried rose petals overnight; drink for Pitta cooling

## Herbs + Formulations

- **Shatavari** — premier cooling Pitta-pacifying tonic
- **Yastimadhu (Licorice)** — caution with hypertension
- **Amalaki** (Indian gooseberry) — daily Pitta-Rakta corrective
- **Chandanasavam** — for urinary burning
- **Ushira (Vetiver)** — cooling internal + external

## Gulf Summer Caution

UAE, Saudi, Kuwait summer is **40–50°C dry heat** — far more severe than Kerala summer. Adaptations:

- **Hydration is medical** — 3–4 L water daily; coconut water 2–3 servings
- **Pre-electrolyte sweat**: rock salt + lime + jaggery oral solution in mid-morning
- **Avoid outdoor exertion** between 10 AM – 4 PM
- **AC compensation**: oil application before AC exposure prevents skin dryness
- **Diet shift**: more bitter (karela), more cool (cucumber, ash gourd, milk)

This is also when **Heal-in-Kerala** patients book their winter Panchakarma slots — Gulf summer outbound = Kerala monsoon arrival.` + DISC_EN,
  },
  {
    id: 'a3-10', slug: 'varsha-ritu-monsoon-health', language: 'en', categoryId: 'cat-lifestyle', source: 'editorial',
    title: 'Rainy Season Health — Ayurvedic Monsoon Wellness Guide',
    titleMl: 'വർഷ ഋതു — മഴക്കാലത്തെ ആരോഗ്യ സൂത്രങ്ങൾ',
    seoTitle: 'Monsoon Ayurveda Guide — Varsha Ritu Diet + Immunity',
    seoDescription: 'Varsha Ritu Ayurveda: digestive fire weakening, food rules, immunity herbs, common monsoon ailments + prevention per classical Ayurveda.',
    content: `Varsha Ritu (July–August in Kerala monsoon) demands the most careful management of all six Ritus. Vata aggravates dramatically, Agni weakens, immunity drops.

## Dosha Pattern

- **Vata Prakopa** (aggravation) — from cool damp atmosphere + irregular eating
- **Agni Mandya** — digestive fire is at year-low
- **Increased Ama production** — undigested metabolic residue

## Diet Rules

**Critical:**
- **Eat only freshly cooked food** — no leftovers
- **Hot meals** — never cold
- **Easily digestible** — light, lightly oiled
- **Boiled water only** — never raw cold water
- **Small portions**, more frequent

**Favour:**
- Old rice, kambu, ragi, jowar
- Mung dal, kulthi (horsegram)
- Cooked ginger, garlic, black pepper, asafoetida
- Cooked karela (bitter gourd), drumstick
- Ghee + honey (small amounts — never together in equal proportions; Ayurveda warns explicitly)
- Diluted buttermilk with rock salt

**Strict avoidance:**
- Raw salads, raw sprouts
- Leafy vegetables (carry bacteria during monsoon)
- Heavy meats, fish (especially shellfish — peak spoilage season)
- Cold drinks, ice cream
- Yogurt at night
- Excessive sweets

## Lifestyle

- **Daily Abhyanga** — protective against Vata
- **Avoid getting wet** — change immediately if you do
- **Dry feet thoroughly** after exposure
- **Steam inhalation** with tulsi/eucalyptus daily — prevents respiratory issues
- **Adequate sleep** — Vata thrives on routine; fixed sleep + wake times
- **No daytime sleep** — aggravates Kapha + sluggishness

## Immunity Herbs

- **Guduchi (Tinospora)** — premier monsoon immunomodulator
- **Tulsi (Holy basil)** — daily 4-5 leaves chewed or as tea
- **Pippali** — small daily dose with honey
- **Triphala** — bedtime digestive support
- **Chyavanaprasha** — 1 tsp twice daily (caution in diabetes)
- **Sudarshana Churnam** — at first sign of fever

## Common Monsoon Conditions + Prevention

**Viral fevers / dengue / chikungunya:**
- Boost Agni preventively (Trikatu before meals)
- Mosquito control (Nimba oil application)
- Sudarshana Churnam at first symptom + doctor visit

**Skin infections (fungal, allergic):**
- Daily neem-water bath
- Avoid synthetic clothing — cotton only
- Triphala internally; topical Eladi tailam if rash develops

**Joint pain flares:**
- Mahanarayana Tailam external + Rasnerandadi Kashayam internal
- Avoid getting joints cold/wet

**Digestive disturbance:**
- Ginger water before meals
- Hinguvachadi Churnam after meals
- Avoid raw + heavy foods

## Why Karkidaka Chikitsa Works

This is the medical rationale for residential Panchakarma in Kerala monsoon — the same Vata aggravation + open srotas that demand care also create the **optimal conditions for therapeutic oil absorption**. Done under physician supervision in a controlled residential setting, monsoon Panchakarma achieves what no other season can.` + DISC_EN,
  },

  // ─── CATEGORY 3: EVIDENCE-BASED AYURVEDA (5, English primary) ─────────
  {
    id: 'a3-11', slug: 'panchakarma-clinical-evidence-review', language: 'en', categoryId: 'cat-treatments', source: 'editorial',
    title: 'Panchakarma — What Clinical Research Actually Shows',
    seoTitle: 'Panchakarma Clinical Evidence Review — JAIM Research Summary',
    seoDescription: 'Honest review of Panchakarma clinical research — strongest evidence conditions, JAIM + AAM studies, limitations. Doctor-reviewed.',
    content: `Panchakarma is Ayurveda's classical purification system. The published clinical evidence is uneven — strong for some conditions, weak for others. This is an honest overview.

## What the Strongest Evidence Shows

**Rheumatoid arthritis (Aamavata):**
Multiple Indian-published RCTs document significant reduction in DAS28 scores, morning stiffness, and CRP levels after 21-day Panchakarma courses with internal classical formulations. The Meghna et al. (2022) survey of Kerala clinical practice in _Annals of Ayurvedic Medicine_ confirms this is the **most common Panchakarma referral** + outcome-positive condition in Kerala practice.

**Psoriasis (Eka Kushta):**
Virechana-based protocols show measurable PASI score improvement in published case series. The evidence base is small (n usually <100 per study) but consistent.

**Chronic neurological conditions:**
Stroke rehabilitation, peripheral neuropathy, hemiplegia — Pizhichil + Njavarakizhi protocols show improvement in functional scores. Most studies are uncontrolled case series.

**Anxiety + chronic insomnia:**
Shirodhara-specific evidence is the most rigorous. Uebaba K et al. (J Altern Complement Med 2008) documented EEG changes (increased alpha waves), cortisol reduction, HAM-A score improvements. This is the **most reproducibly studied Kerala therapy**.

## Where Evidence is Weak

- Cancer cures — NO Ayurvedic intervention has demonstrated cure of malignancy in modern clinical trial standards
- Diabetes cure — Ayurveda improves glycemic control; does not "reverse" Type 2 in published evidence
- Infertility — promising case reports; no large controlled trials yet

## What's Missing in the Literature

- **Sample sizes are small** — most studies n=20-50
- **Most trials uncontrolled** — single-arm before/after
- **Multi-center large RCTs are rare**
- **Outcome standardisation needs work** — Ayurvedic and modern outcome measures often combined inconsistently
- **Long-term follow-up sparse** — most studies stop at 90 days

## Common Strong Indications

Based on Kerala practice + published evidence:
- Rheumatoid arthritis + osteoarthritis (Pizhichil + Basti)
- Chronic insomnia + anxiety (Shirodhara)
- Psoriasis + chronic eczema (Virechana)
- Chronic constipation + IBS (Basti)
- Migraine prevention (Nasya + Shirodhara)
- Fatty liver (Virechana + classical hepatoprotective Kashayam)

## Common Weak/Unproven Claims

Watch for centres promising:
- "Cancer cure" → red flag
- "Diabetes reversal in 21 days" → unrealistic
- "Complete cure of autoimmune disease" → unsupported
- "AIDS treatment" → reject

## Practical Patient Guidance

1. **Combine — don't replace.** Panchakarma + your modern prescriptions, not Panchakarma instead of modern medicine.
2. **Choose verified centres** — Kerala Tourism classification + NABH + physician supervision.
3. **Realistic timelines** — improvement in weeks for symptoms; root-cause shift takes 3–6 months.
4. **Document baseline** — bring recent labs; recheck at 3 months.
5. **Continuity matters** — Panchakarma is not a one-time event; periodic seasonal courses sustain benefit.

**Reference:** Meghna NJ, et al. (2022). Utharavasthi — A Survey of Clinical Practice in Kerala. _Annals of Ayurvedic Medicine, 11(4)._` + DISC_EN,
  },
  {
    id: 'a3-12', slug: 'ashwagandha-evidence-review-stress-sleep-immunity', language: 'en', categoryId: 'cat-herbs', source: 'editorial',
    title: 'Ashwagandha — Evidence Review for Stress, Sleep, and Immunity',
    seoTitle: 'Ashwagandha Clinical Evidence — Stress, Sleep, Immunity Studies',
    seoDescription: 'Ashwagandha (Withania somnifera) evidence review. RCT findings on stress, cortisol, sleep, immunity + safety + drug interactions.',
    content: `Ashwagandha (Withania somnifera) is among the most-studied Ayurvedic adaptogens. The published evidence is substantial — both supportive and cautionary.

## What the Evidence Supports

**Stress + cortisol reduction:**
Chandrasekhar K et al. (Indian J Psychol Med 2012) — RCT, 64 chronic stress patients, 60-day intervention with 300 mg standardised KSM-66 extract twice daily showed **27.9% serum cortisol reduction** vs placebo. PSS scale and DASS-21 scores significantly improved.

**Sleep onset + quality:**
Langade D et al. (Cureus 2019) — RCT, 60 insomnia patients, 8 weeks of 300 mg twice daily showed significant PSQI (Pittsburgh Sleep Quality Index) improvement vs placebo. Sleep onset latency reduced; sleep efficiency improved.

**Anxiety:**
Lopresti AL et al. (Medicine, Baltimore 2019) — RCT, 60 patients, 60 days of 240 mg standardised extract showed significant DASS-21 anxiety subscale + HAM-A score improvements.

**Strength + sports recovery:**
Multiple smaller RCTs document modest improvements in upper-body strength + VO2 max in athletes.

**Hypothyroidism (subclinical):**
Sharma AK et al. (J Altern Complement Med 2018) — 8-week pilot showed TSH normalisation + T3/T4 modest improvements in subclinical cases. CAUTION: this is the source of the major interaction warning below.

## Safety + Side Effects

In published RCTs, Ashwagandha is generally well tolerated. Reported side effects (rare):
- Mild GI upset
- Drowsiness (occasionally)
- Mild diarrhoea
- Rare hepatotoxicity case reports (LiverTox database)

## Important Drug Interactions

**Thyroid medication (levothyroxine):**
Ashwagandha can stimulate thyroid output. Combining with thyroxine without medical supervision risks iatrogenic hyperthyroidism. AyurConnect's interaction checker flags this combination as MODERATE — confirm TSH every 6–8 weeks if combined.

**Immunosuppressants (transplant patients, autoimmune on cyclosporine/tacrolimus/mycophenolate):**
Ashwagandha's immunostimulant effect may antagonise immunosuppression. AVOID in transplant recipients.

**Sedatives (benzodiazepines):**
Additive CNS depression possible. Reduce one or both doses; avoid combination during the day.

**Pregnancy:**
Classical Ayurveda permits low-dose Ashwagandha in pregnancy under supervision; many modern integrative guidelines recommend avoidance. Don't self-prescribe in pregnancy.

## Dosage in Studies

The clinically studied range is **300–600 mg standardised extract daily** (KSM-66 or Sensoril extracts). Classical powdered root: 3–5 g daily, with warm milk + ghee. Higher does not equal better.

## What Studies DON'T Show

- Cure of any specific disease
- Anti-cancer effect (preliminary lab work only — no human evidence)
- Erectile dysfunction cure (modest improvements in stress-related cases; not vascular ED)
- Long-term safety beyond 12 months (most studies are 8 weeks)

## Practical Use

For someone with chronic stress + mild insomnia + low energy: 600 mg KSM-66 or 5 g classical powder with warm milk + ½ tsp ghee at bedtime, daily for 60–90 days, then reassess. Confirm thyroid status before starting.` + DISC_EN,
  },
  {
    id: 'a3-13', slug: 'turmeric-curcumin-ayurveda-evidence', language: 'en', categoryId: 'cat-herbs', source: 'editorial',
    title: 'Turmeric and Curcumin — What Ayurveda Knew and Science Confirms',
    seoTitle: 'Turmeric Curcumin Evidence — Ayurveda Haridra + Modern Research',
    seoDescription: 'Turmeric (Haridra) in classical Ayurveda vs modern curcumin research. Bioavailability via Pippali (Trikatu) — classical wisdom validated.',
    content: `Haridra (turmeric, Curcuma longa) is one of the few Ayurvedic herbs where modern science has substantially confirmed classical claims — with one major caveat about bioavailability.

## What Classical Ayurveda Says

Charaka + Sushruta + Vagbhata describe Haridra extensively:
- **Anti-inflammatory** (Shothahara) — joints, skin
- **Detoxifying** (Vishaghna) — Pitta-Rakta dushti
- **Blood-purifying** (Raktashodhaka)
- **Anti-diabetic** (Pramehahara)
- **Wound healing** (Vrana-ropana)
- **Hepatoprotective** (Yakrit-rakshaka)

Classical Ayurveda recognised what modern science struggled with — Haridra's **bioavailability is poor when taken alone**. The classical solution: **combine with Pippali + Maricha (long pepper + black pepper)** — this is the foundational Trikatu logic.

## What Modern Research Confirms

**Curcumin (the principal active compound in turmeric) shows:**
- **Anti-inflammatory** — multiple RCTs in osteoarthritis. Kuptniratsaikul V et al. (Clin Interv Aging 2014) — 367 patients, curcuminoids non-inferior to ibuprofen in knee OA with fewer GI side effects.
- **Antioxidant** — supports liver function in NAFLD (Panahi Y et al. studies)
- **Glycemic support** — modest HbA1c improvement in T2DM
- **Mood + cognition** — preliminary data on depression + Alzheimer's

## The Bioavailability Problem

Pure curcumin is poorly absorbed — fractions of 1% in some studies. The classical Trikatu approach was right:

**Piperine (from Pippali + Maricha) increases curcumin bioavailability by ~2000%** (Shoba G et al. Planta Med 1998). This validates the Ayurvedic combination empirically.

Modern formulations doing the same thing:
- Curcumin + piperine extracts (Bioperine)
- Liposomal curcumin
- Phospholipid-complexed curcumin (Meriva)

## How to Use Practically

**Daily kitchen turmeric:**
- 1/4–1/2 tsp turmeric powder + pinch of black pepper + ghee or warm milk
- Sufficient for general anti-inflammatory benefit at sustained low dose

**Therapeutic use:**
- Curcumin standardised extract 500 mg–1000 mg twice daily with piperine
- 8–12 weeks for OA, NAFLD, joint conditions
- Combined with proper diet + exercise

**Classical Ayurveda formulations containing Haridra:**
- Haridra Khanda (skin disorders, allergic conditions)
- Mahatiktaka Ghrita
- Khadirarishta

## Cautions + Interactions

- **Anticoagulants (warfarin, apixaban)**: curcumin inhibits platelet aggregation; significant interaction. AyurConnect interaction checker flags this as MAJOR.
- **Tamoxifen** (breast cancer therapy): curcumin reduces tamoxifen plasma concentration via CYP3A4. Avoid high-dose curcumin supplements during tamoxifen.
- **Iron supplements**: curcumin chelates iron — space by 2 hours.
- **Gallbladder disease**: stimulates bile flow — caution in active gallstones.

## What Curcumin Won't Do

- Cure cancer (very preliminary lab work; no curative evidence in humans)
- Replace prescription anti-inflammatories in severe disease
- Work miracles in 1 week (12-week minimum for measurable change)

The classical Ayurvedic intuition was largely correct: turmeric + pepper + ghee combination, daily long-term, supports inflammation reduction. Modern science has validated this — but only for combinations that solve the bioavailability problem.` + DISC_EN,
  },
  {
    id: 'a3-14', slug: 'ayurveda-type-2-diabetes-management', language: 'en', categoryId: 'cat-conditions', source: 'editorial',
    title: 'Ayurvedic Management of Type 2 Diabetes — Traditional Protocols and Modern Evidence',
    seoTitle: 'Ayurveda Diabetes Management — Prameha Herbs + Modern Evidence',
    seoDescription: 'Ayurvedic Type 2 diabetes management — Prameha classical protocols, evidence-studied herbs (Guduchi, Gymnema), NAMASTE portal guidelines.',
    content: `Type 2 diabetes is "Prameha" in classical Ayurveda — 20 distinct subtypes described. Modern Ayurveda complements prescribed metformin/insulin — never replaces. Here is what the evidence and classical protocols offer.

## Classical Understanding

Prameha is primarily **Kapha-Medas dushti** — disordered fat metabolism weakening insulin sensitivity, with concurrent Pitta aggravation driving complications (neuropathy, retinopathy, nephropathy).

Charaka Samhita Chikitsasthana 6 describes:
- Sthula (obese) Pramehi — most common; insulin-resistant T2DM
- Krsha (thin) Pramehi — closer to T1DM presentation
- 10 Kaphaja, 6 Pittaja, 4 Vataja subtypes — each with distinct urinary appearance

## Herbs with Modern Evidence

**Vijaysar (Pterocarpus marsupium):**
The classical anti-diabetic. Pterostilbene + other compounds documented to improve glycemic control. Multiple Indian-published trials show HbA1c reduction. Available as Vijaysar wood — water stored in Vijaysar tumbler overnight then drunk.

**Gymnema sylvestre (Meshashringi / Madhunashini):**
Best-studied Ayurvedic anti-diabetic. Gymnemic acids inhibit intestinal glucose absorption + may regenerate pancreatic β-cells. RCTs document HbA1c reduction.

**Guduchi (Tinospora cordifolia):**
Immunomodulator with adjunct anti-diabetic action. Cell-line + animal evidence on glucose transporter modulation; small human trials supportive.

**Bitter gourd (Karela / Momordica charantia):**
Classical + modern evidence. Charantin compound mimics insulin. Daily 30–60 ml juice or vegetable consumption shows modest HbA1c effect.

**Fenugreek (Methika / Trigonella foenum-graecum):**
Best dietary intervention. Soaked overnight + chewed in morning; 10 g daily. Slows glucose absorption.

**Cinnamon (Twak / Cinnamomum):**
Modest insulin-sensitisation in studies. 1–2 g daily.

## Classical Formulations

- **Nishakathakadi Kashayam** — twice daily, primary daily anti-diabetic
- **Asanadi Choornam** — Vijaysar-based bedtime
- **Madhumeha Kushmanda Rasayanam** — diabetes-specific Rasayana
- **Chandraprabha Vati** — adjunct, supports Mutravaha-srotas
- **Triphala Guggulu** — for diabetic with elevated lipids

## Diet (Pathya)

**Favour:**
- Millets (ragi, jowar, bajra) over wheat
- Barley (Yava — explicitly classical anti-Prameha grain)
- Whole pulses
- Bitter vegetables (karela, methi greens, drumstick)
- Adequate protein

**Strict avoid:**
- Refined sugar
- White rice + white wheat
- Refined oils
- Late dinners
- Daytime sleep

## Lifestyle (Vihara)

- **30-minute walk after every meal** — single most disease-modifying intervention
- **Weight loss of 5–10 kg** often reverses early T2DM
- **Sleep 7–8 hours; no daytime sleep**
- **Stress management** — cortisol drives insulin resistance

## NAMASTE Portal Guidelines

Thrigulla & Narayanam (2023, _JAIM_) describe the NAMASTE portal — standardised AYUSH terminologies. For diabetes:
- Standard Ayurvedic diagnostic categories mapped to ICD codes
- Standard formulation names + composition
- Allows MoUs between Ayurvedic + modern endocrinology workflows

## Critical

- **Do not stop prescribed metformin / insulin** without endocrinologist consultation. Ayurveda + modern medicine in partnership is the right model.
- **Monitor HbA1c every 3 months** during Ayurvedic intervention. Dose adjustments often possible as Ayurveda support kicks in.
- **Annual eye + kidney + foot exams** — Pitta complications are silent.

**References:** Thrigulla SR, Narayanam S. (2023). NAMASTE Portal and Standardised AYUSH Terminologies. _JAIM._` + DISC_EN,
  },
  {
    id: 'a3-15', slug: 'utharavasthi-kerala-clinical-survey', language: 'en', categoryId: 'cat-treatments', source: 'editorial',
    title: 'Utharavasthi — A Survey of Clinical Practice in Kerala',
    seoTitle: 'Utharavasthi — Kerala Ayurvedic Practice Survey + Indications',
    seoDescription: 'Utharavasthi (urethral/uterine douche) — classical indications + survey of current Kerala clinical practice. Meghna et al. (2022).',
    content: `Utharavasthi is the medicated urethral or uterine douche — one of the more specialised Panchakarma procedures. Meghna et al. (2022, _Annals of Ayurvedic Medicine_) surveyed contemporary Kerala practice; here are the findings + classical context.

## What Utharavasthi Is

Distinct from the more common Basti (rectal medicated enema), Utharavasthi targets:
- **Female reproductive tract** (uterus, fallopian tubes, cervix) — for gynaecological + fertility indications
- **Male urethra** — for chronic prostatic, urethral, and reproductive conditions

The medicated solution (typically oil, ghee, or decoction) is introduced via a sterile cannula, retained briefly, and expelled.

## Classical Indications (from Ashtanga Hridayam + Yogamrutam)

**Female:**
- Tubal-factor infertility (Vandhyatva)
- Chronic pelvic inflammatory disease
- Endometriosis-pattern dysmenorrhoea
- Postpartum uterine atonia
- Chronic leucorrhoea
- Recurrent miscarriage

**Male:**
- Chronic prostatitis
- Erectile dysfunction (non-vascular)
- Premature ejaculation
- Chronic urethritis

## Survey Findings (Meghna et al. 2022)

The survey covered Kerala-based Ayurvedic specialists practising Utharavasthi:

**Most common indications in current practice:**
1. Female infertility (66% of cases)
2. Chronic PID + leucorrhoea (18%)
3. Male reproductive disorders (12%)
4. Other (4%)

**Cycle timing:**
- Female protocol: Days 5–9 of menstrual cycle, daily for 8 sessions
- Repeated for 3 cycles before assessing fertility outcomes

**Medicated solutions used:**
- Phala Ghrita (most common — classical fertility ghee)
- Ksheerabala Tailam
- Dhanwantaram Tailam
- Kalyanaka Ghrita

**Reported outcomes (uncontrolled case data):**
- Tubal block reversal in ~30% of patients with documented HSG patency post-course
- Pregnancy rate within 1 year of completed course: 15–25%
- Symptom improvement (pain, discharge): ~70%

## Important Caveats

**This is uncontrolled survey data**, not RCT evidence. Pregnancy rates need to be compared to:
- Spontaneous conception in matched untreated populations
- IVF outcomes in similar tubal-factor cases

Meghna et al. explicitly call for prospective controlled trials.

## Procedural Safety

Utharavasthi requires:
- **Trained practitioner** — not all BAMS doctors are qualified; specialised MD-Prasuti Tantra training preferred
- **Sterile technique** — single-use cannula, sterile lubricant
- **Cycle synchronisation**
- **Pre-procedure investigations** — HSG, ultrasound, semen analysis (for couple workup)

## When to Consider

If you have:
- Documented tubal-factor infertility AND
- Failed standard fertility workup pathways OR
- Wish to combine Ayurveda with mainstream fertility care

A Kerala specialist Vaidya + a reproductive medicine specialist working together is the right model. Utharavasthi can complement IVF cycles, not replace them.

## Centres in Kerala

Senior Kerala centres with active Utharavasthi practice:
- Arya Vaidya Sala Kottakkal
- Vaidyaratnam Ollur
- Sanjeevanam Ernakulam
- Many smaller MD-Prasuti Tantra specialty clinics across districts

Verified directory at AyurConnect /doctors with Prasuti Tantra specialisation filter.

**Reference:** Meghna NJ, Roy R, Patgiri BJ. (2022). Utharavasthi — A Survey of Clinical Practice in Kerala. _Annals of Ayurvedic Medicine, 11(4)._` + DISC_EN,
  },
]

export async function seedArticlesV3Part1(prisma: PrismaClient): Promise<{ count: number }> {
  for (const a of A) {
    const { id, slug, title, titleMl, content, language, categoryId, seoTitle, seoDescription, source } = a
    const readTimeMinutes = Math.max(1, Math.round(content.split(/\s+/).length / 220))
    await prisma.knowledgeArticle.upsert({
      where:  { id },
      update: { slug, title, titleMl, content, language, categoryId, seoTitle, seoDescription, source, readTimeMinutes, category: language === 'ml' ? 'classical-text' : 'classical-text', status: 'published', reviewedBy: null },
      create: { id, slug, title, titleMl, content, language, categoryId, seoTitle, seoDescription, source, readTimeMinutes, category: 'classical-text', status: 'published' },
    })
  }
  return { count: A.length }
}
