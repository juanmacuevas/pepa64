# Contributing

Ideas, bug reports, phonetic evidence and reviewed translations are welcome. Use GitHub issues and pull requests; do not upload volunteer recordings, personal data or access tokens to the repository.

Code and documentation contributions are accepted under the repository's MIT license. This does not license third-party research data or participant voices. See [data policy](docs/DATA_POLICY.md).

Keep the current digit table and indices stable unless an alphabet change has been explicitly discussed. Pronunciation, instructional aids and study protocols have separate version identifiers. Cite primary sources for specialized phonetic claims; distinguish inventory frequency, population coverage, production and listening accuracy.

For a language aid, provide the language/variety, literal wording, intended IPA targets, known ambiguities, and who reviewed it. A translation should explain how to learn the same sounds rather than substitute or merge digits. Native-language metadata does not imply the interface has been validated in that language.

Run `npm test`, `npm run typecheck`, and `npm run build` from `web/` for app changes. Tests must cover interpretation and data boundaries, not merely copy the implementation. Do not include real participant data in fixtures. See [protocol](docs/EXPERIMENT.md) and [development guide](web/README.md).
