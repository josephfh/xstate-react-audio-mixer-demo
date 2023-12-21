import {
  ActorRefFrom,
  assertEvent,
  assign,
  createMachine,
  enqueueActions,
} from "xstate";
import { trackMachine } from "./track.machine";

const INITIAL_NUMBER_OF_TRACKS = 8;
const MAXIMUM_NUMBER_OF_TRACKS = 16;

export type MixerMachineEvents =
  | { type: "mixer.addTrack" }
  | { type: "mixer.clearTracks" }
  | { type: "mixer.deleteTrack"; id: string };

export const mixerMachine = createMachine(
  {
    id: "mixer",
    context: {
      trackActorRefs: [],
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
        trackActorRefs: ActorRefFrom<typeof trackMachine>[];
      };
      events: MixerMachineEvents;
    },
  },
  {
    actions: {
      addTrack: assign({
        trackActorRefs: ({ context, self, spawn }) =>
          context.trackActorRefs.concat(
            spawn(trackMachine, {
              input: {
                id: `track${Date.now()}`,
                parent: self,
              },
            })
          ),
      }),
      clearTracks: enqueueActions(({ context, enqueue }) => {
        context.trackActorRefs.map((trackActorRef) =>
          enqueue.stopChild(trackActorRef.id)
        );
        enqueue.assign({
          trackActorRefs: [],
        });
      }),
      createInitialTracks: assign({
        trackActorRefs: ({ self, spawn }) =>
          [...Array(INITIAL_NUMBER_OF_TRACKS)].map((_, index) =>
            spawn(trackMachine, {
              input: { id: `track${index}`, parent: self },
            })
          ),
      }),
      deleteTrack: enqueueActions(({ context, event, enqueue }) => {
        assertEvent(event, "mixer.deleteTrack");
        enqueue.assign({
          trackActorRefs: context.trackActorRefs.filter(
            (trackActorRef) =>
              trackActorRef.getSnapshot().context.id !== event.id
          ),
        });
        enqueue.stopChild(event.id);
      }),
    },
    guards: {
      maximumTracksNotReached: ({ context }) => {
        return context.trackActorRefs.length < MAXIMUM_NUMBER_OF_TRACKS;
      },
    },
  }
);
