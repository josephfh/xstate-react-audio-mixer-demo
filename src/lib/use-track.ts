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
  // TODO: Is there a better way of dealing with trackRef being seen as possibly unavailable
  const emptyActor = createEmptyActor() as ActorRefFrom<typeof trackMachine>;
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
