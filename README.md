# Conway's Game of Life

A full-screen cellular automaton. It seeds a random grid, then runs forever at 5 generations per second. No dependencies, no framework — vanilla DOM.

## What you see

The grid fills the whole window: dark navy cells are dead, pink cells are alive. Cell size is roughly 30px, so the grid dimensions depend on your window at the moment the page loads. Refresh for a completely new random board.

There are no controls — it just runs. Cells show a pointer cursor, but clicking does nothing; the cell-painting code was never finished and is still commented out in `src/index.js`.

## The rules

Each generation, every cell looks at its eight neighbours:

- A live cell with fewer than two live neighbours dies (underpopulation)
- A live cell with two or three live neighbours survives
- A live cell with more than three live neighbours dies (overpopulation)
- A dead cell with exactly three live neighbours becomes alive (reproduction)

The grid does not wrap — cells on the edge simply have fewer neighbours, so patterns tend to die off or stabilise at the borders.

If every cell dies, a panel appears with the generation count and a button to start over. In practice you will rarely see it: a random board this size almost always settles into still-lifes and blinkers that persist indefinitely.

## Running it

Needs Node 24.

```sh
npm install
npm run dev
```

| Script              | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run build`     | Production build into `dist/`           |
| `npm run check`     | Format, lint and type-check in one pass |
| `npm run check:fix` | Same, but writes fixes                  |
| `npm run clean`     | Remove everything generated             |
| `npm run dev`       | Dev server with HMR                     |
| `npm run preview`   | Serve the built output                  |
| `npm run test`      | Run tests                               |

Built on [Vite+](https://viteplus.dev), which bundles the dev server, bundler, test runner, linter, formatter and type checker into one dependency. It is all configured from `vite.config.ts`.

## Layout

```text
src/
├── index.html    entry — the Vite root is src/, not the repo root
├── index.js      the whole app
└── styles.css
```

Every generation rebuilds the entire grid as fresh DOM and swaps it in, which is wasteful but simple enough to follow. Cell colour comes from a `data-status` attribute the CSS selects on, so rendering is just setting an attribute.
