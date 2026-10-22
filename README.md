# GOLD QUEST — شکار طلایی

A browser arcade game in Persian, built with React 19, TypeScript, Phaser 3 and Vite. Includes original SVG artwork, a self-hosted Vazirmatn font, synthesized sound effects, 36 local questions, and three 90-second levels. No gameplay backend, paid API, or player account is required.

## Run locally

Use Node.js 22 or newer and npm. From the extracted `gold-quest` folder:

```bash
npm install
npm run dev
```

Open **http://localhost:4173**. Vite also prints a LAN address for testing on a phone on the same network.

```bash
npm test
npm run build
npm run preview
```

The production build is written to `dist/`. `npm run preview` serves that build for local inspection; it is not a production hosting server.

## Publish as a website

Deploy the entire `dist/` folder at the root of a static website. All runtime assets and questions are local files. Keep the `art/`, `assets/`, and `questions.json` paths together with `index.html`.

- **Netlify:** import this project with build command `npm run build` and publish directory `dist`, or drag the already built `dist` folder into Netlify's manual deploy UI.
- **Vercel:** import the project, choose Vite, set build command `npm run build` and output directory `dist`, then deploy.
- **Other static hosts:** upload the contents of `dist` to the site root. No server-side routes or environment variables are needed.

The game itself does not require authentication. The accompanying Sites-hosted delivery is private by default; hosting access is separate from the game. The `.openai` directory is deployment metadata for that delivery and is not needed on Vercel or Netlify. The downloadable source archive excludes it.

### GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`. It tests and builds the game on every push to `main`, then publishes `dist/` with GitHub Pages. The Vite base is relative, so both project URLs (`username.github.io/repository/`) and account URLs (`username.github.io`) work without changing the repository name in source code.

1. Create an empty GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Open the **Actions** tab and wait for “Deploy GOLD QUEST to GitHub Pages” to finish.
5. The deployment job and **Settings → Pages** show the final game URL.

For an existing repository:

```bash
git add .
git commit -m "Deploy GOLD QUEST to GitHub Pages"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If `origin` already exists, do not add it again; inspect it with `git remote -v` and use `git remote set-url origin NEW_URL` only when it is wrong.

Vite documentation: https://vite.dev/guide/static-deploy.html
Phaser scale documentation: https://docs.phaser.io/phaser/concepts/scale-manager

## Play

Click or tap the mine, use the launch button, or press **Space** while the hook points toward a treasure. Every treasure, including gems, requires a correct answer. Time freezes throughout the question, feedback and successful or failed return sequence. Score is awarded only when a correctly answered treasure reaches the miner. A wrong answer reveals the correct option, animates the treasure back to its exact starting coordinates, and restores its collision state.

**Escape** pauses/resumes. Switching browser tabs pauses automatically; returning requires Resume. The pause menu includes restart and return home. Sound is unlocked only after a gesture and can be disabled. Sound preference and unlocked levels are the only locally stored data; no analytics or tracking is included.

| Treasure | Score | Retrieval |
| --- | ---: | --- |
| Small gold | 100 | Fast |
| Medium gold | 250 | Medium |
| Large gold | 500 | Slow |
| Turquoise gem | 750 | Medium, with particles |

| Level | Target | Active time | Questions |
| --- | ---: | ---: | --- |
| معدن تازه‌کارها | 1,000 | 90 seconds | Easy |
| غار بلورین | 1,500 | 90 seconds | Easy + medium |
| چالش طلایی | 2,000 | 90 seconds | All difficulties |

Reaching the target does not end the timer early: the round ends when active time runs out or every treasure has been collected. Stars are based on answer accuracy after meeting the target (1 star below 50%, 2 from 50%, 3 from 80%). A failed round can always be retried. Rocks retract the hook without points or a question.

## Edit the question bank

Edit **`public/questions.json`**, then rebuild. The JSON must be an array of at least 30 unique questions. Answers have exactly four nonempty, distinct entries, and `correctAnswerIndex` is zero-based. Keep at least one easy question for level 1.

```json
{
  "id": 1,
  "category": "علوم",
  "difficulty": "easy",
  "question": "بزرگ‌ترین سیارهٔ منظومهٔ شمسی کدام است؟",
  "answers": ["زمین", "مشتری", "مریخ", "زهره"],
  "correctAnswerIndex": 1
}
```

Allowed difficulty values: `easy`, `medium`, `hard`. The bank is validated before gameplay. The question deck remembers used IDs across level changes and retries within the current page session. It only resets the eligible pool after it is exhausted. Each question's answers are shuffled with a preserved correct mapping. The app does not evaluate arbitrary code from the question file.

## Source map

- `src/App.tsx`: Persian welcome screen, HUD, quiz, pause/help and results, keyboard/visibility controls.
- `src/game/scene.ts`: Phaser renderer, sprites, pendulum/claw visualization, particles, dust, subtle background parallax, scene integration.
- `src/game/model.ts`: frame-driven game state and movement, swept collisions, timer, single-award collection and exact reset logic. Phaser's update loop drives it; it is also independently testable.
- `src/game/questions.ts`: data validation and nonrepeating shuffled question pool.
- `src/game/levels.ts`: difficulty, treasure coordinates, values, speeds and obstacles.
- `src/game/audio.ts`: small Web Audio synthesizer; no external audio downloads.
- `src/style.css`: responsive RTL interface and reduced-motion support.
- `public/art/`: six original SVG assets, with gradients and faceted lighting.
- `tests/game.test.ts`: automated rules and interaction-sequence tests.

The canvas uses a fixed 1000×680 world with Phaser FIT scaling, so resizing does not change object positions or hit areas. React updates at most ten times a second during stable states; state changes are emitted immediately. Decorative animation is disabled for reduced-motion users. The launch/catch/retrieval movement remains because it communicates essential gameplay.

## Verification

`npm test` verifies 13 cases: question validation, pool exhaustion and answer remapping; successful collection without early or duplicate awards; incorrect answer exact reset and recatch; rapid input rejection; pause/resume; quiz and return timer freeze; timeout during extension and retrieval; reachable targets and resets on all three levels; menu/restart cleanup; edge/tunnelling collision; and 30/60 fps trajectory agreement.

The production TypeScript/Vite build passes. SVG assets were rendered and visually inspected. Interactive browser acceptance tests and device testing could not be performed in the creation environment because its managed browser preview service was unavailable. Do not interpret the passing simulation tests as a claim of tested Safari/iPhone/Android compatibility.

Before public release, manually check:

1. Desktop click/Space: catch a gold, answer correctly, observe zero points until arrival, then a single increment and removal.
2. Wrong answer: verify answer reveal, original-position return, unchanged score and the same treasure can be caught again.
3. Phone portrait: check HUD/quiz readability, tap launch and answers, page width, portrait/landscape resize, and safe areas.
4. Complete a level, verify reward results, next level, retry, final-level completion and time-expired loss.
5. Pause during a catch, switch tabs, mute/unmute, restart during feedback, and turn on reduced motion.

Browser support targets current Chrome, Firefox, Edge, Safari and mobile browsers supporting WebGL/Canvas and Web Audio. Phaser automatically chooses WebGL or Canvas. If audio is unavailable, the game continues silently; failed essential loads offer a retry screen.
