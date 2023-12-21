import { useSelector } from "@xstate/react";
import { mixerActor } from ".";
import { trackMachine } from "../machines";
import { ActorRefFrom, createEmptyActor } from "xstate";

export const useTrack = (trackRef: string) => {
  const trackActor = useSelector(mixerActor, (snapshot) =>
    snapshot.context.trackRefs.find((ref) => ref.id === trackRef)
  );
  const emptyActor = createEmptyActor() as ActorRefFrom<typeof trackMachine>;

  // Although the spawned machines will always be available when we use this logic, React doesn't know it so we provide fallbacks for everything we make available
  return {
    muted: trackActor
      ? useSelector(trackActor, (snapshot) => snapshot.context.muted)
      : true,
    send: trackActor ? trackActor.send : emptyActor.send,
    volume: trackActor
      ? useSelector(trackActor, (snapshot) => snapshot.context.volume)
      : 0,
  };
};
