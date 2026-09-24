Self-hosted web fonts, latin subset, from Google Fonts. Both families are
licensed under the SIL Open Font License 1.1 (https://openfontlicense.org).
Copyright and licence URL are embedded in each file's name table.

instrument-serif-latin.woff2         Instrument Serif Regular, 20 KB.
                                     Copyright 2022 The Instrument Serif Project Authors.
instrument-serif-italic-latin.woff2  Instrument Serif Italic, 21 KB.
manrope-latin.woff2                  Manrope, Copyright 2019 The Manrope Project Authors.
                                     Variable, trimmed to wght 400-700, 22 KB.

Instrument Serif sets H1, H2 and display numerals. Manrope sets everything
else. Manrope and Instrument Serif Regular are preloaded from
_partials/head.html; the italic loads on first use.

Manrope was trimmed with fontTools varLib.instancer. To widen the weight
range, re-download from Google Fonts and re-run the instancer with the new
limits. Font URLs carry no ?v= hash on purpose, so the preload and the
@font-face request match and the file is fetched once.
