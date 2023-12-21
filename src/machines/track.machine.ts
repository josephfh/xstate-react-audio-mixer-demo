import { ActorRef, Snapshot, assertEvent, assign, createMachine } from "xstate";
import { MixerMachineEvents } from ".";

const INITIAL_TRACK_VOLUME = 20;

export const trackMachine = createMachine(
  {
    id: "track",
    context: ({ input }) => ({
      id: input.id,
      muted: false,
      parent: input.parent,
      volume: INITIAL_TRACK_VOLUME,
    }),
    initial: "idle",
    states: {
      idle: {
        on: {
          "track.deleteTrack": {
            actions: ["deleteTrack"],
          },
          "track.setVolume": {
            actions: ["setVolume"],
          },
          "track.toggleMuted": {
            actions: ["toggleMuted"],
          },
        },
      },
    },
    types: {} as {
      context: {
        id: string;
        muted: boolean;
        parent: ActorRef<Snapshot<unknown>, MixerMachineEvents>;
        volume: number;
      };
      events:
        | { type: "track.deleteTrack" }
        | { type: "track.setVolume"; volume: number }
        | { type: "track.toggleMuted" };
      input: {
        id: string;
        parent: ActorRef<Snapshot<unknown>, MixerMachineEvents>;
      };
    },
  },
  {
    actions: {
      deleteTrack: ({ context }) =>
        context.parent.send({ type: "mixer.deleteTrack", id: context.id }),
      setVolume: assign(({ event }) => {
        assertEvent(event, "track.setVolume");
        return {
          volume: event.volume,
        };
      }),
      toggleMuted: assign(({ context }) => ({
        muted: !context.muted,
      })),
    },
  }
);
