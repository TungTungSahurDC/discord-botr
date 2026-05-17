# Miliastra & The Land Down Undah

A full Node.js-hosted Erica-powered web app for the main bot **ineffa**.

## Included updates

- Miliastra animated GIF icon added.
- ineffa profile image added.
- Local sign up, login, logout, and guest mode.
- Profile picture upload saved to localStorage.
- Theme accent saving fixed.
- Chat background saving fixed.
- Music autoplay attempt with Majo no Tabitabi OPLiterature Piano Cover at 20% volume.
- Music volume slider saved locally.
- Sound effects toggle saved locally.
- Discord server widget on the homepage.
- Bot selector is intentionally locked to ineffa.
- Add new bot / Bot Builder section is now marked Coming Soon.
- Responsive layout for desktop, tablet, and phones.
- Image Studio with up to 4 reference URLs.
- Optional streaming, debug tools, and request-scoped tool schema toggle.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Open:

```txt
http://localhost:3000
```

## Environment

```env
ERICA_API_KEY=your_new_api_key_here
DEFAULT_CHARACTER=https://verba.ink/v/ineffa_o1r
PORT=3000
```

Do not put API keys in frontend JavaScript. Keep them in `.env` only.

## Latest patch

- Fixed theme schemes so the full app palette changes, not only the accent color.
- Added theme-colored scrollbars.
- Added more UI sounds: hover, click, send, success, error, and page-change tones.
- Added Elaina-inspired custom cursor modes: wand, witch hat, magic star, and broom.
- Added login particles.
- Added extra animations across cards, buttons, messages, panels, icons, and selected themes.
- Added About Erica Panganiban page with Instagram and Discord information.
- Added locked Ineffa scenario presets based on fantasy/Genshin-style lore prompts.
- Kept Add New Bot as Coming Soon and locked bot selection to ineffa.

## v5 patch notes

- Added automatic chat titles for new adventures.
- Messages now show the user display name or bot name above each bubble.
- Added message actions: copy, quote, retry assistant reply, and delete.
- Fixed custom cursor alignment/hotspot so clicking feels natural.
- Reworked button glaze into a cleaner subtle highlight.
- Changed default user profile picture to `neverness-to-everness-nte.gif`.
- Profile picture uploads now keep GIF animation instead of converting GIFs to JPEG.
- Added a custom profile-picture picker design.
- Added more UI sounds and particles on login/home.
- Added extra Elaina-inspired cursor options.

## v6 update notes

- Web search is now enabled by default for ineffa through the Erica API request-scoped tool option.
- The web search tool uses a public JSON search endpoint and is sent with `tool_choice: auto`.
- Added keyboard shortcuts:
  - Alt + U: focus username
  - Alt + P: focus password
  - Ctrl/Cmd + K: search adventures
  - Ctrl/Cmd + N: new adventure
  - Ctrl/Cmd + Enter: submit login or send chat
  - Alt + H/C/S: Home, Chat, Settings
  - Ctrl/Cmd + /: shortcut help
- Added a 17+ homepage badge link.
- Added Spotify playlist widget on the homepage.
- Added animated music player status; local piano music pauses when Spotify mode is used.
- Fixed the custom cursor hotspot so the actual click point is marked by the glowing dot.

## v7 patch notes

- Added a new “What ineffa can do” section on the homepage.
- Added quick chat chips inside the chat screen.
- Added clearer web-search-enabled behavior for ineffa through the request-scoped tool payload.
- Added user profile context to chat requests so ineffa reads the current user’s saved display name instead of assuming the user is Erica.
- Added a floating animated music player that appears when the music button is used.
- Improved Spotify embed settings and added a fallback “Open Spotify playlist” link.
- Fixed the decorative custom cursor so the browser’s real click point remains accurate.
- Added more hover, message, card, panel, home, and music animations.

## v8 patch

- Added context-aware GIF reactions from ineffa after bot replies.
- Added a setting to enable/disable GIF reactions.
- Added two more piano tracks while retaining the original Literature piano cover.
- Local music now plays as a looping playlist across all three tracks instead of looping only one file.
- Added next/previous track controls on the homepage and settings page.
- Updated the animated music player labels to show the current track.

## v9 update

- Hides the native cursor when a custom Elaina-style cursor is active, while keeping clicks accurate.
- Floating music player can be hidden/unhidden; it is automatically removed on mobile view.
- Added editable ineffa bot settings: reply style, creativity/temperature, max tokens, and displayed bot nickname.
- Clicking ineffa's icon opens a bot profile modal based on the app/API profile details.
- Added live GIF search endpoint. Requests like "send me a gif of Qiqi from Genshin Impact" now return a searched GIF.
- Login page now uses autoplaying muted background video:
  - desktop/laptop/tablet: `login-desktop.mp4`
  - phone: `login-mobile.mp4`
- Login background video is dimmed with 60% brightness/opacity styling and hidden controls.

## v10 fixes

- Fixed the custom cursor so it appears again on desktop and the white dot is the exact click point.
- Styled the About Erica links so Instagram no longer appears as a default blue browser link.
- Removed Tenor usage for GIFs. `/api/gif` now tries GIPHY with `GIPHY_API_KEY` and falls back to a curated GIF library.
- Rebuilt the Spotify playlist embed with a stronger frame wrapper and a visible fallback button.
- Added visible Bot Settings buttons from the chat header and homepage, which jump directly to the ineffa bot settings card.

## v11 patch

- Native cursor is no longer hidden. The Elaina-style cursor is now decorative, so normal clicking remains accurate.
- Added a visual novel-style Elaina introduction before the login page.
- Added the Elaina intro portrait as the introduction background.
- Added two Elaina GIF decorations on the login screen, hidden automatically on mobile.
- Login screen still uses the responsive autoplay background videos from v9.

## v12 patch

- Added a homepage Patch Log panel that loads patch notes from `README.md` through `/api/patchlog`.
- Fixed homepage scrolling on desktop, tablet, and mobile by making the active app view scrollable.
- Added a hide/show toggle for the chat bot information strip.
- The bot info strip now collapses the ineffa profile details, locked bot selector, and bot settings button while keeping a compact ineffa indicator visible.
- The collapsed bot info preference is saved locally.

## v13 Patch

- Context GIF reactions now use the current chat context instead of repeating one default GIF.
- Auto GIFs rotate through multiple matching options and avoid repeating the previous GIF when possible.
- After GIF reactions, the chat keeps focus on the latest text/image message and returns focus to the message box.
- Image Studio now shows an animated generation stage while the image is being created.
- Image results now show the image model label.
- Generated images now include a Download image button in both chat and gallery.
- Added a backend image download proxy at `/api/download-image` so generated images can be saved more reliably.

## v14 Patch

- Fixed web search by adding Erica backend search assist through `/api/web-search`, then injecting the results into the active chat request as context.
- Fixed long chat lists by making the sidebar chat list properly scrollable.
- Added a second bot: `qiqi` with character URL `https://verba.ink/v/qiqi_gp6` and local profile image `qiqi-profile.jpg`.
- Updated chat, bot profile modal, bot settings, bot selector, messages, profile display, Image Studio, and homepage components to support multiple bots.
- Re-enabled Elaina-themed custom cursor items as decorative cursor effects while keeping the real browser click point accurate.
- Made the floating music player draggable and saved its position locally.
- Added softer Elaina-themed page transition animations between intro, login, and the main app.
- Switched GIF search to KLIPY through `/api/gif` using `KLIPY_API_KEY`, with curated fallbacks if the API returns no result.
- Added Discord-style emoji reactions for the latest user message beside the chat textbox.
- Added click-to-preview modal for Image Studio generated images.
- Improved the Discord server widget area on the homepage.
