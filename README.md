# Pepa64

A language‑agnostic, **speakable Base‑64 alphabet** based on 64 consonant‑vowel (CV) syllables. 
Encodes any binary data as short, rhythmic syllable strings that are easy to read, dictate, and remember.

## Why Pepa64?

Classic Base‑64 is great for e‑mail and URLs, but not for human speech:  
`A Q g / + 8 =` is hard to read aloud and error‑prone over the phone.

Pepa64 replaces the 64 visual symbols with **64 syllables** carefully chosen to:

* Use only very common phonemes found in most languages.  
* Be **clearly distinct** from one another (no “b” vs “p”, “d” vs “t” pairs).  
* Spell with plain ASCII (`sh`, `ch` digraphs), so no accents or IPA needed.  
* Map **exactly one syllable per 6‑bit chunk**—just like classic Base‑64.  

## The 64 syllables

Pepa64 starts with **13 consonants** and **5 vowels**  
(13 × 5 = 65 possible CV pairs) and simply **drops `yi`**,  
the only pair that tends to collapse into a plain “ee” sound.  
That leaves a neat, pronounceable alphabet of **64 syllables**.

|   | a | e | i | o | u |
|---|---|---|---|---|---|
| **p**  | pa | pe | pi | po | pu |
| **t**  | ta | te | ti | to | tu |
| **k**  | ka | ke | ki | ko | ku |
| **m**  | ma | me | mi | mo | mu |
| **n**  | na | ne | ni | no | nu |
| **f**  | fa | fe | fi | fo | fu |
| **s**  | sa | se | si | so | su |
| **sh** | sha| she| shi| sho| shu|
| **h**  | ha | he | hi | ho | hu |
| **ch** | cha| che| chi| cho| chu|
| **l**  | la | le | li | lo | lu |
| **r**  | ra | re | ri | ro | ru |
| **y**  | ya | ye | —  | yo | yu |


### Consonant set & ordering

We chose **13 consonants** that phoneme‑frequency surveys (PHOIBLE, UPSID) list among the most widespread sounds.  
They are grouped by *manner of articulation* and arranged roughly **front‑to‑back in the mouth**, making the sequence easy to remember:

| Group | List | Rationale |
|-------|------|-----------|
| **Plosives** | **p t k** | Short, high‑energy bursts; present in ~90 % of languages. |
| **Nasals** | **m n** | Acquired early by children; unmistakable nasal resonance. |
| **Fricatives** | **f s sh h** | From front (labiodental) to back (glottal); each has a distinct hiss/breath profile. |
| **Affricate** | **ch** | A stop‑plus‑frication package; acoustically unique. |
| **Liquids** | **l r** | Smooth continuants; many languages merge them, so keeping both maximises contrast. |
| **Glide** | **y** | Palatal /j/—a semi‑vowel that caps the list with the highest sonority. |

Sequence to loop over:  
`p t k m n f s sh h ch l r y`

### Vowel set & ordering

We keep the **five “cardinal” vowels**—`a e i o u`—because they span the vowel space and appear, in some form, in the majority of the world’s phoneme inventories.  
Ordering follows the common “front‑to‑back, low‑to‑high” classroom layout:

`a e i o u`

### Indexing rule

1. Walk the consonant list above.  
2. Inside each consonant, walk the vowels `a e i o u`.  
3. Skip the single forbidden pair **yi**.  

That assigns **pa → 0**, **pe → 1**, … all the way to **yu → 63**.

### Example applications – random samples

Below are random data blocks of various bit‑lengths encoded with Pepa64.  
Syllables are grouped in sets of four for easier reading.

| Use case               | Pepa64 sample                      |
|------------------------|------------------------------------|
| Random 32‑bit value    | su fe chi ko · ru cho              |
| Random 48‑bit value    | pa mo ko ta · fa re sho ho         |
| Random 24‑bit value    | cho ma yu che                      |
| Random 20‑bit value    | ti la ko pa                        |
| Random 60‑bit value    | ya mo ko ta · fa re sho ho · le sa |

## Status & roadmap

* Reference encoders/decoders (Python, JS) under construction.  
* Drafting an **Informational Internet‑Draft** for an Independent‑stream RFC.  
* Planned extras: CLI tool, web demo, QR‑code helper.

---

## License

MIT License – see `LICENSE` for full text.

---

## References

* RFC 1751, RFC 1760, RFC 2289 – speakable key encodings  
* FIPS 181 – pronounceable password generation  
* PGP Word List – byte‑to‑word mapping for fingerprints

