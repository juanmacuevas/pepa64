# Pilot data and contribution policy

Version: `consent-2026-09-v1`.

The MIT license covers the project code and documentation, not participants' recordings, language profiles, or responses. Third-party dependencies retain their own licenses.

## What participants agree to

Adults who choose to participate authorize the Pepa64 project maintainer to store their submitted recordings, language information and task responses, play submitted recordings to other consenting pilot participants, and analyze them to evaluate Pepa64 communication. This is a non-exclusive permission limited to this study and its operation. Participants retain any rights in their recordings. They may stop at any time and request deletion using the same browser's **My contributions** controls.

There is no permission here to sell voices, clone voices, train speech models, or publish a downloadable voice corpus. Any later open dataset needs a separate, explicit contribution agreement. An open license such as CC BY or CC0 is deliberately not applied to volunteer voices by default. See [Creative Commons license explanations](https://creativecommons.org/cc-licenses/).

## Data collected

- Native languages, optional language variety and other-language experience, interface language, and IPA familiarity.
- Consent/protocol version, random participant identifier and timestamps.
- Assigned prompts, submitted audio, selected-attempt count and reported recording duration.
- Transcription text (including mistakes), parsing/scoring results, playback count and elapsed time.

Do not say your name or other personal information in a recording. A voice may identify a person: these data are pseudonymous, not guaranteed anonymous. The app does not request names, email, location or advertising identifiers. Hosting providers may process ordinary connection/access logs under their own policies.

The app stores a random access token on the device, not the research dataset. It grants access to that participant's contributions. Export controls provide metadata and individual audio downloads; no public audio listing exists. Losing browser storage loses self-service access. The private pilot must not be opened for broad recruitment until a reliable private contact/recovery channel and deployment-specific retention/backup policy are supplied by the operator. Do not post recordings or access tokens in GitHub issues.

## Withdrawal and retention

The app's deletion operation removes the participant's profile, submitted clips and related responses, and their responses to other clips from active application storage. Previously heard/downloaded audio cannot be recalled. Provider backups and logs need an operator-specific retention policy; this prototype does not promise their immediate erasure or an automatic timed purge. The maintainer should erase pilot data after evaluating the instrument unless participants explicitly agree to a further study. Review and document a concrete retention period before wider recruitment.

## Maintainer responsibilities

The repository maintainer is Juanma Cuevas. The first hosted version is an owner-only test environment, not a globally launched recruitment site. Before inviting volunteers publicly, configure the study operator's contact details, review privacy/consent requirements for the actual jurisdiction and audience, verify withdrawal and storage behavior, and provide a way to report inappropriate clips. This document describes the implemented pilot; it is not a claim of legal or ethics-board approval.
