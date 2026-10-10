# Harmoni: Synthesis Project

A web version of the useful parts of Harmoni, the Kingdom Sanctuary Choir app, built with only HTML, CSS and the JavaScript from Nixon chapters 13–14.

## How to run
Keep this folder structure and open `index.html` with your local dev server:

```
harmoni/
├── index.html
├── style.css
├── script.js
└── images/
    ├── logo.svg
    └── choir.jpg
```
The Cinzel and Manrope fonts load from Google Fonts, so you need internet for the exact look. Changes are kept only while the page is open.

## The two screens
| Screen | What it does |
|---|---|
| **Home** | Choir photo, pick your voice part, register for upcoming services, your songs, the two latest announcements |
| **Songs** | Search by title or artist, filter (All / My Part / Rehearsing / New), open a song for notes, key, next rehearsal, YouTube and lyrics links, change its status, add new songs |

## Left out of this version, and why
Login and sign-up, chat, calendar and mentorship all need a server, a database or JavaScript beyond chapters 13–14. The practice checklist and announcement posting were left out to keep the project focused.

## Where each lesson shows up
| Lesson / chapter | Where |
|---|---|
| L2: Head metadata | charset, viewport, description, author, favicon, font and stylesheet links |
| L3: Structure, lists, emphasis | `header`, `nav`, `main`, `section`, `article`, `footer`; `ul` practice links, `dl` song facts |
| L4: Links, images, tables | Choir photo in `figure`/`figcaption`, logo image; YouTube/lyrics links with `target="_blank"`; services table |
| L5: Forms, HTML APIs | Add-song form: text, `select`, `textarea`, checkboxes, radios, `required`/`minlength`/`maxlength`, `<output>`; reading `.value` and `.checked` |
| L6: CSS | Class/id/attribute selectors, combinators (`.hero figcaption`, `td.date strong`), `:hover`/`:focus`/`:invalid`, `calc()` for the tab and card widths, `rgba()`, `transform`, `@media` |
| Ch 13 | External script, variables, functions, `$()` shortcut (Example 13-8), `innerHTML` |
| Ch 14 | `if`/`else`, `switch` (`badge`, `songMatches`, `safeText`), ternary `?:`, `for`, `while` counting down (`drawHomeNews`), `break`, `continue`, `try...catch`, `parseInt`, `toUpperCase`, `!` to flip true/false, the `onclick` event |

## Code worth explaining in the demo
- **`contains(text, word)`**: the search. It tries every starting position and compares letter by letter (nested loops + `break`). It's used for search *and* for "does this song have my part?".
- **`showScreen(name)`**: one loop switches which section and which tab are active by changing `className`.
- **`songMatches(j)`**: a `switch` on the filter, then the search check.
- **Parallel arrays**: `songTitles[j]`, `songArtists[j]` and so on, because objects come in chapter 15.

## Suggested demo flow (under 5 minutes)
1. Home: change "I sing" to Alto and watch the songs and part chips update; register for a service (45 s).
2. Songs: search "sinach", try each filter, open Way Maker, use the YouTube link, change its status (1 min).
3. Add a song and show it appear in the library and on Home (45 s).
4. Code walk-through: the arrays, `showScreen`, `contains`, `songMatches`, `addSongFromForm` (2 min).
