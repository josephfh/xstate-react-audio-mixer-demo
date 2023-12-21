import { useSelector } from "@xstate/react";
import { mixerMachine } from "../machines";
import { createActor } from "xstate";

export const mixerActor = createActor(mixerMachine);

mixerActor.start();
mixerActor.subscribe((snapshot) => {
  console.log(snapshot.value);
});

export const useMixer = () => ({
  trackActorRefs: useSelector(
    mixerActor,
    (snapshot) => snapshot.context.trackActorRefs
  ),
  trackCount: useSelector(
    mixerActor,
    (snapshot) => snapshot.context.trackActorRefs.length
  ),
  send: mixerActor.send,
});
