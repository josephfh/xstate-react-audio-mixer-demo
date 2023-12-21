import {
  ActorRefFrom,
  assertEvent,
  assign,
  createMachine,
  enqueueActions,
} from "xstate";
import { trackMachine } from "./track.machine";

const INITIAL_NUMBER_OF_TRACKS = 4;
const MAXIMUM_NUMBER_OF_TRACKS = 16;

export type MixerMachineEvents =
  | { type: "mixer.addTrack" }
  | { type: "mixer.clearTracks" }
  | { type: "mixer.deleteTrack"; id: string };

export const mixerMachine = createMachine(
  {
    id: "mixer",
    context: {
      trackRefs: [],
    },
    initial: "idle",
    states: {
      idle: {
        entry: ["createInitialTracks"],
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
        trackRefs: ActorRefFrom<typeof trackMachine>[];
      };
      events: MixerMachineEvents;
    },
  },
  {
    actions: {
      addTrack: assign({
        trackRefs: ({ context, self, spawn }) =>
          context.trackRefs.concat(
            spawn(trackMachine, {
              input: {
                id: `track${Date.now()}`,
                parent: self,
              },
            })
          ),
      }),
      clearTracks: enqueueActions(({ context, enqueue }) => {
        context.trackRefs.map((trackRef) => enqueue.stopChild(trackRef.id));
        enqueue.assign({
          trackRefs: [],
        });
      }),
      createInitialTracks: assign({
        trackRefs: ({ self, spawn }) =>
          [...Array(INITIAL_NUMBER_OF_TRACKS)].map((_, index) =>
            spawn(trackMachine, {
              input: { id: `track${index}`, parent: self },
            })
          ),
      }),
      deleteTrack: enqueueActions(({ context, event, enqueue }) => {
        assertEvent(event, "mixer.deleteTrack");
        enqueue.assign({
          trackRefs: context.trackRefs.filter(
            (trackRef) => trackRef.getSnapshot().context.id !== event.id
          ),
        });
        enqueue.stopChild(event.id);
      }),
    },
    guards: {
      maximumTracksNotReached: ({ context }) =>
        context.trackRefs.length < MAXIMUM_NUMBER_OF_TRACKS,
    },
  }
);
