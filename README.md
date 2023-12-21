This is an unfinished POC for an XState audio mixer

```
pnpm i
pnpm dev
```

Aims of this demo

- XState v5
- React
- Uses useSelector() to keep React's fondness of re-rendering to a minimum
  Typescript
- A parent machine that has an array of spawned child machines in its context
- A way to manage the lifecycle of child machines so we don't run out of memory (stopping machines before removing them?)
- (mostly for me) separated implementation from React components, separate components for audio tracks
