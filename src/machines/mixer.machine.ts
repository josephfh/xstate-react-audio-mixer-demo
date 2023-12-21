import { ActorRefFrom, assign, createMachine } from "xstate";
import { trackMachine } from "./track.machine";

const INITIAL_NUMBER_OF_TRACKS = 8;
const MAXIMUM_NUMBER_OF_TRACKS = 16;

export const mixerMachine = createMachine(
  {
    id: "mixer",
    context: {
      trackActorRefs: [],
    },
    initial: "initializing",
    states: {
      initializing: {
        entry: ["createInitialTracks"],
        always: "idle",
      },
      idle: {
        on: {
          ["mixer.addTrack"]: {
            actions: ["addTrack"],
            guard: "maximumTracksNotReached",
          },
          ["mixer.clearTracks"]: {
            actions: ["clearTracks"],
          },
          ["mixer.deleteTrack"]: {
            actions: ["deleteTrack"],
          },
        },
      },
    },
    types: {} as {
      context: {
        trackActorRefs: ActorRefFrom<typeof trackMachine>[];
      };
      events:
        | { type: "mixer.addTrack" }
        | { type: "mixer.clearTracks" }
        | { type: "mixer.deleteTrack"; id: string };
      guards: {
        type: "maximumTracksNotReached";
      };
    },
  },
  {
    actions: {
      addTrack: assign({
        trackActorRefs: ({ context, self, spawn }) =>
          context.trackActorRefs.concat(
            spawn(trackMachine, {
              input: {
                id: `track${Date.now()}`, // TODO: This machine uses the current timestamp as a unique ID so it can be deleted later. Is there a better way?
                parent: self,
              },
            })
          ),
      }),
      clearTracks: assign({
        trackActorRefs: [], // TODO: Do the spawned machines also need to be stopped as part of the clean up?
      }),
      createInitialTracks: assign({
        trackActorRefs: ({ self, spawn }) =>
          [...Array(INITIAL_NUMBER_OF_TRACKS)].map((_, index) =>
            spawn(trackMachine, {
              input: { id: `track${index}`, parent: self },
            })
          ),
      }),
      deleteTrack: assign(({ context, event }) => {
        if (event.type !== "mixer.deleteTrack") throw new Error();
        // TODO: How are spawned machines stopped?
        // TODO: Is there a better way of removing machines rather than use their ID?
        return {
          trackActorRefs: context.trackActorRefs.filter(
            (trackActorRef) =>
              trackActorRef.getSnapshot().context.id !== event.id
          ),
        };
      }),
    },
    guards: {
      maximumTracksNotReached: ({ context }) => {
        // TODO: Type error: maximumTracksNotReached is never used in the machine definition
        return context.trackActorRefs.length < MAXIMUM_NUMBER_OF_TRACKS;
      },
    },
  }
);
