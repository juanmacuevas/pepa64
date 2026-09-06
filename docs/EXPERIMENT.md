# Pepa64 pilot protocol

Version: `pilot-2026-09-v1`. Alphabet: `pepa64-v1`. Pronunciation: `ipa-tap-v1`. Familiarization: `written-guide-v1`.

This is an exploratory instrument pilot, not a validated global listening study. No human reference recordings have yet been approved. Initial trials use a written pronunciation guide; later audio-trained cohorts must receive a new condition identifier. Do not pool those conditions silently.

## Question and scope

Can participants communicate random Pepa64 digit sequences through recordings and blind transcription, and which confusions appear across speaker–listener language groups? The first prototype does not measure arithmetic, decimal conversion, delayed memorization, or live conversational repair.

Participants may volunteer as speakers, listeners, or both. Record one or several native languages, optional language variety/other-language experience, interface language, and familiarity with IPA. Country and ethnicity are not proxies for native language. The prototype provides Spanish and English instructions; other native languages can be entered without implying that a teaching aid has been validated for them.

## Pronunciation target

Consonants: [p t k m n f s ʃ h t͡ʃ l ɾ j]. Vowels: [a e i o u]. The `r` reference is a single alveolar tap [ɾ], not an English approximant or a required trill. This is an experimental choice, not a claim of cross-language optimality. Review it with a phonetician before an audio-trained study. Keep reference version, teaching aids, and raw recordings so alternative realizations can be analyzed.

Canonical ASCII and digit indices remain invariant. Local writing aids may explain pronunciation but may not merge two digit identities. The initial guide localizes explanations, not the alphabet. Never generate unreviewed transliterations automatically and label them authoritative.

## Tasks

1. Consent and language profile. Participation is restricted to adults in this pilot. A device token identifies the participant without collecting a name or email.
2. Written guide and an unscored segmentation exercise (`peshayu` → `pe sha yu`). This checks understanding of the writing task, not hearing or pronunciation. The participant explicitly confirms reading the guide.
3. Recording: a server-generated prompt of 2, 4, or 6 digits, uniform independent indices with replacement. Lengths rotate per participant. Repeated digits and leading `pa` are permitted: these are fixed-length digit strings, not canonical integers. Pure random sampling is the implemented baseline; population-wide balancing is a future scheduler improvement.
4. The participant records at most 20 seconds, may review and rerecord, and explicitly uploads the selected attempt. Record attempt count, duration, prompt, profile snapshot and protocol version. Local discarded attempts are not uploaded.
5. Listening: assign an unseen recording from another participant. Do not reveal target text, digit count, speaker language, or correctness before submission. A recording can have multiple listeners. Prioritize recordings with fewer completed responses, randomizing ties. Exclude the listener's own recordings and prompts they have been shown as a speaker. Pending assignments resume on reload.
6. Preserve typed text, normalized interpretation, parse failures, self-reported inability to understand, playback count and client elapsed time. Accept malformed strings rather than silently correcting them. Submit each assignment once. There is no correctness feedback in measured trials.

The prototype counts audio playback starts; a interrupted playback is not a full listen. Client timings/counts and reported audio duration are untrusted measurements, suitable for exploratory analysis rather than proof of human participation. Actual sound duration should be derived from media during analysis. API requests do not prove that somebody listened.

## Outcomes and analysis

Primary pilot outcome: exact sequence recovery, stratified by length, speaker and listener language, and protocol version. Secondary outcomes: substitutions, insertions, deletions, parse failures, playback starts, recording attempts, audio duration and response time. Use sequence alignment; a missing digit must not make all subsequent digits appear substituted. Report invalid strings separately; do not turn them into valid ones by dropping characters.

Typing speed, guide consultation, speech duration and replay time are different costs. Do not call their mixture a pure speech rate. Compare encodings on the same payload range in a later comparative study. No checksum is included in this pilot.

Responses to one speaker/clip are correlated. Resample or model participants and recordings, not individual responses as independent people. A convenience sample does not establish population coverage; collect several independent speakers and listeners per language and report uncertainty before making comparisons. Weighting by language population requires a separately specified population and sampling plan.

There are no seed voices or simulated contributions presented as real data. An empty listening queue honestly asks for recordings. The first deployment is private for operational testing. Before wider recruitment: review pronunciation with speakers/phoneticians, add approved human reference audio, review translations, verify consent/retention/contact details, test microphone behavior on iOS/Android, and add deployment-level abuse controls and a moderation workflow. Do not reject a recording solely because an accent produces errors. Silence, technical corruption, unrelated speech and reports of inappropriate content are separate quality issues.

## Data and reproducibility

Store authoritative prompts on the server. Listening responses refer to assigned clip IDs, never client-supplied ground truth. Participant exports include their own metadata and recordings; deletion removes their clips and associated responses, their responses to others, and their profile. Keep deletion available after failed storage operations so it can be retried. No raw voice dataset is licensed for public redistribution.

The maintainer can export the database and object storage using the provider's authenticated administrative tools. Preserve protocol versions and foreign keys during export; exclude session-token hashes from research exports. The data dictionary is the schema in `web/db/schema.ts`. See [data policy](DATA_POLICY.md) and [deployment notes](../web/README.md).

## Sources

- [Logan, Lively & Pisoni (1991)](https://pubmed.ncbi.nlm.nih.gov/2016438/): context and training matter for nonnative contrasts; not a validation of this alphabet.
- [Common Voice (2019)](https://arxiv.org/abs/1912.06670): precedent for volunteer speech collection and distributed validation; our blind transcription task differs.
- [IPA chart](https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_TI/IPA_charts_TI.html): sound-symbol reference.
