# Pepa64

An experimental base-64 numeral system whose digits are written as consonant–vowel (CV) syllables: `pa`, `pe`, `pi`, …, `yu`.

Pepa64 explores how to communicate numbers aloud using few syllables and a small, reusable alphabet. It was originally motivated by sharing global coordinates over audio. The current focus is the numeral system and its phonetic foundation; coordinates and checksums are possible later applications or extensions.

The alphabet and its indexing rule are defined below. Ease of pronunciation, listening accuracy across languages, and memorability are **design goals, not established results**. This repository includes an integer converter and an exploratory browser pilot for recording and blind transcription. No published listening study has validated the repertoire.

## Try the pilot

The [web prototype](web/README.md) supports two voluntary tasks: reading a short random sequence into a microphone, and transcribing another participant's recording. It includes Spanish/English instructions, multiple native-language selection, a written guide, data export and withdrawal. The first hosted version is private for operational testing; it contains no fabricated participant recordings.

To run locally (Node.js 22.13+; Node.js 24 LTS recommended):

```sh
cd web
npm ci
npm run db:local
npm run dev
```

Open the local URL printed by the server. A second browser profile can act as a different participant. Microphone access needs localhost or HTTPS. See the [experiment protocol](docs/EXPERIMENT.md), [data policy](docs/DATA_POLICY.md), and [contribution guide](CONTRIBUTING.md) before using the prototype for a study.

## The 64 digits

Combine these consonant spellings with the vowels in the stated order, omitting `yi`:

```text
Consonants: p t k m n f s sh h ch l r y
Vowels:     a e i o u
```

| Consonant | a | e | i | o | u |
|---|---|---|---|---|---|
| p | pa | pe | pi | po | pu |
| t | ta | te | ti | to | tu |
| k | ka | ke | ki | ko | ku |
| m | ma | me | mi | mo | mu |
| n | na | ne | ni | no | nu |
| f | fa | fe | fi | fo | fu |
| s | sa | se | si | so | su |
| sh | sha | she | shi | sho | shu |
| h | ha | he | hi | ho | hu |
| ch | cha | che | chi | cho | chu |
| l | la | le | li | lo | lu |
| r | ra | re | ri | ro | ru |
| y | ya | ye | — | yo | yu |

Read each row from left to right, then move to the next row. Number the entries from 0, skipping the missing entry:

```text
pa = 0, pe = 1, pi = 2, po = 3, pu = 4, ta = 5, …
ya = 60, ye = 61, yo = 62, yu = 63
```

There are `13 × 5 − 1 = 64` distinct digits. The current alphabet contains no `w`, `b`, `d`, or `g`.

The spellings use lowercase ASCII. There are 54 two-character digits and ten three-character digits, because `sh` and `ch` are digraphs. Every digit ends in exactly one of `a e i o u`, with no such vowel inside its consonant spelling, so valid text can be split unambiguously after each vowel. For example, `peshayu` splits into `pe sha yu`. This textual property does not establish reliable segmentation in speech.

## Representing non-negative integers

Use ordinary positional notation in base 64, with the most significant digit first. For digit indices `d₀ … dₖ₋₁`:

```text
n = d₀ × 64^(k−1) + d₁ × 64^(k−2) + … + dₖ₋₁
```

For a canonical integer representation, write zero as `pa` and omit leading `pa` digits for positive integers. The empty string is not an integer representation. Canonical spelling concatenates the lowercase digits; spaces below only expose the digit boundaries for reading. Negative numbers, fractions, and general input-normalization rules are outside this initial convention.

| Decimal input | Digit indices | Pepa64 | Recovery |
|---|---|---|---|
| 0 | 0 | `pa` | 0 |
| 1 | 1 | `pe` | 1 |
| 63 | 63 | `yu` | 63 |
| 64 | 1, 0 | `pepa` | 1 × 64 + 0 |
| 65 | 1, 1 | `pepe` | 1 × 64 + 1 |
| 4095 | 63, 63 | `yuyu` | 63 × 64 + 63 |
| 4096 | 1, 0, 0 | `pepapa` | 1 × 64² + 0 × 64 + 0 |

Thus `pepa` represents decimal 64. An integer representation preserves a value, not an original byte length or leading zero bits.

## Numbers and binary data are different conventions

Each alphabet index corresponds exactly to six bits, from `000000` to `111111`. This makes the alphabet suitable for a binary encoding, but an alphabet alone does not specify a complete data format.

For example, compare integer notation with an **illustrative bit-grouping convention**: take input bits most significant first, group from the left in sixes, and append zero bits on the right to complete the final group.

```text
Integer 1:  [1] → pe

Byte 0x01:  00000001
            000000 01[0000]  (brackets mark added zero bits)
            [0, 16] → pa me

Recovery with the original length of 8 bits:
pa me → 000000 010000 → keep the first 8 bits → 00000001
```

Under that same convention, these examples have explicit inputs and recoverable outputs. Input lengths include leading zeros; hexadecimal notation does not imply byte alignment for the 20- and 60-bit examples.

| Input bits | Hex input | Six-bit indices | Pepa64 digits | Added zero bits |
|---|---|---|---|---|
| 32 | `89ABCDEF` | 34, 26, 47, 13, 59, 48 | `su fe chi ko ru cho` | 4 |
| 48 | `0123456789AB` | 0, 18, 13, 5, 25, 56, 38, 43 | `pa mo ko ta fa re sho ho` | 0 |
| 24 | `C0FFEE` | 48, 15, 63, 46 | `cho ma yu che` | 0 |
| 20 | `1F234` | 7, 50, 13, 0 | `ti la ko pa` | 4 |
| 60 | `F123456789ABCDE` | 60, 18, 13, 5, 25, 56, 38, 43, 51, 30 | `ya mo ko ta fa re sho ho le sa` | 0 |

To recover each input, concatenate the six-bit indices and keep the stated number of input bits. Unlike canonical integer notation, leading `pa` digits can be significant here.

A future binary format must specify byte/bit order, padding, length recovery, empty input, accepted separators, and canonical decoding. Arbitrary bit strings need special attention: `1`, `10`, and `100` all become `100000` under right-zero-padding, so their original lengths must be recoverable. Byte-aligned inputs have different length constraints.

[RFC 4648](https://www.rfc-editor.org/rfc/rfc4648) is a useful reference for byte encoding and canonical padding. The examples above do not yet define a standalone Pepa64 binary format or compatibility with RFC 4648 Base64.

## Phonetic design: working hypotheses

The intended structure is one consonant followed by one vowel per digit. Avoiding voiced/unvoiced pairs such as `b/p` removes those particular distinctions from the alphabet; it does not establish that all remaining digits are easy to distinguish.

Four questions need separate evaluation:

1. Can a speaker produce a usable realization of a digit?
2. Can a listener distinguish it from the other digits?
3. Does its spelling lead readers to the intended pronunciation?
4. Can listeners recover digit boundaries and order in continuous sequences?

### Pronunciation and variation

The pilot uses the following **provisional phonetic targets**, version `ipa-tap-v1`. They make the experimental condition explicit without changing the digit table or claiming that these targets are optimal:

| Canonical spelling(s) | IPA target(s), in the same order | Note |
|---|---|---|
| `p t k` | [p t k] | Stops |
| `m n` | [m n] | Nasals |
| `f s sh h` | [f s ʃ h] | Fricatives; `h` is audible, not silent |
| `ch` | [t͡ʃ] | Affricate |
| `l` | [l] | Lateral |
| `r` | [ɾ] | One alveolar tap, as in Spanish *pero* |
| `y` | [j] | Palatal glide, not the IPA vowel [y] |
| `a e i o u` | [a e i o u] | Vowel quality targets, not letter names |

Concatenate the targets to describe a digit: `sha` → [ʃa], `cha` → [t͡ʃa], `ra` → [ɾa]. The `r` choice is an experimental starting point, not an approved set of all acceptable rhotic variants. Reference recordings and acceptable-variation criteria still need review. The first pilot explicitly records its familiarization condition as `written-guide-v1`; there are no approved audio teaching examples yet. Consult the [International Phonetic Association chart](https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_TI/IPA_charts_TI.html) for the symbols.

The vowel order `a e i o u` is conventional. These are five vowel labels, not a claim that there are only five cardinal vowels or that this order traces an articulatory progression. Cardinal vowels are phonetic reference qualities; their primary set contains eight. See [UCL's introduction to vowel qualities](https://www.phon.ucl.ac.uk/courses/spsci/SSC_talking/material/week_03/sounds-of-the-worlds-languages.pdf).

Accent variation may be acceptable when listeners can still recover different digits reliably. This must be evaluated across speaker–listener groups, rather than assumed from the spelling or from a single reference speaker.

### Open questions in the current alphabet

* **`l/r`:** keeping both adds symbols but may introduce a difficult contrast for some listeners. Experiments on English /r/ and /l/ with Japanese listeners show difficulties and training effects; they do not directly determine performance for the pilot's [l]/[ɾ] targets. See [Logan, Lively and Pisoni (1991)](https://pubmed.ncbi.nlm.nih.gov/2016438/).
* **Omitting `yi`:** the omission originated in a concern that [ji] might approach an isolated [i]. This is a design hypothesis, not a demonstrated universal problem. An isolated vowel is not another valid digit, so similarity alone does not prove information loss; segmentation in sequences must also be tested. There is no established evidence here that `yi` is the only problematic combination.
* **The complete repertoire:** the consonants, vowels, their combinations, and transitions between digits all need evaluation. The current table is a candidate, not a proven optimum.

[PHOIBLE](https://phoible.org/faq) and [UPSID](https://phoible.org/contributors/UPSID) provide evidence about phonological inventories. They do not measure dictation accuracy. UPSID samples across language families, so frequency in that database is not population coverage. Choosing sounds for many people requires an explicit target population and evidence about actual speaker–listener performance.

## Why base 64? What about base 60?

Base 64 provides a direct mapping between a digit and a six-bit block. A regular `12 × 5` CV table would instead give base 60.

```text
Base 60: log₂(60) ≈ 5.90689 bits per digit
Base 64: log₂(64) = 6 bits per digit
Relative capacity gain: 6 / log₂(60) − 1 ≈ 1.5763%
```

These are nominal capacities, attained with uniformly distributed digits, not measured speech rates. Both bases need six digits to cover every 32-bit value. A phonetic cost could outweigh the small capacity advantage, and base 60 remains worth comparing without changing the current table prematurely.

Oral and written compactness are different: with uniformly distributed digits, Pepa64 averages `(54 × 2 + 10 × 3) / 64 = 2.15625` ASCII characters per digit, excluding separators.

## Related work

* [Proquints](https://arxiv.org/html/0901.4016) encode 16 bits in a CVCVC group, using 16 consonants and four vowels. They are a close precedent for pronounceable identifiers.
* [RFC 1751](https://www.rfc-editor.org/rfc/rfc1751.html) represents 128-bit keys using twelve short English words, through two 64-bit blocks with parity.
* [PGP Word List](https://philzimmermann.com/docs/PGP_word_list.pdf) represents bytes using two alternating word lists, with the alternation intended to help detect sequence errors.

Pepa64 investigates CV digits as a positional numeral system and their potential for communication across languages. This is a direction to evaluate, not a claim of global originality or superiority over these approaches.

## Next steps and validation

The proposed practical objective is useful information recovered correctly per unit of time, including pauses and repetitions. Whole-message accuracy and unresolved errors should be reported alongside speed. Fair comparisons require the same input values or payloads and a stated amount of familiarization.

1. Review the provisional IPA targets and teaching aids with phoneticians/native speakers, then prepare human reference recordings under a new training condition.
2. Exercise the prototype locally/private first, including two-participant exchange, export and withdrawal, and microphone behavior on mobile browsers. The integer converter and round-trip tests are included; a binary format remains separate.
3. Run a small pilot with several speakers per language. The initial app uses 2-, 4- and 6-digit sequences; isolated-digit and targeted-contrast tasks can follow under explicit protocol versions.
4. Refine the tasks before expanding recruitment. Report results by speaker and listener language, language experience, and training condition; an aggregate score should not hide groups with poor results. Any population weighting must be explicit.

A browser-based study with translated instructions and reusable human recordings could make participation geographically accessible. Recordings from one group can be evaluated asynchronously by others. Synthetic speech or automatic recognition can help prototype tasks, but cannot substitute for evidence about human communication. A small pilot would test the method and expose problems; it would not establish global coverage.

Formal standardization and application-specific tools can follow a clearer specification and empirical evidence.

## License

[MIT License](LICENSE) for code and documentation. Third-party dependencies retain their licenses. Participant audio and research data are **not** covered by MIT or automatically released as an open dataset; see the [separate pilot data policy](docs/DATA_POLICY.md).
