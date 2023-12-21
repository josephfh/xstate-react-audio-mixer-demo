import { useSelector } from "@xstate/react";
import { mixerActor } from ".";
import { trackMachine } from "../machines";
import { ActorRefFrom, createEmptyActor } from "xstate";

export const useTrack = (actorRef: string) => {
  const trackRef = useSelector(mixerActor, (snapshot) =>
    snapshot.context.trackActorRefs.find(
      (trackActorRef) => trackActorRef.id === actorRef
    )
  );
  const emptyActor = createEmptyActor() as ActorRefFrom<typeof trackMachine>;

  // Although the spawned machines will always be available when we use this logic, React doesn't know it so we provide fallbacks for everything we make available
  return {
    muted: trackRef
      ? useSelector(trackRef, (snapshot) => snapshot.context.muted)
      : true,
    send: trackRef ? trackRef.send : emptyActor.send,
    volume: trackRef
      ? useSelector(trackRef, (snapshot) => snapshot.context.volume)
      : 0,
  };
};
