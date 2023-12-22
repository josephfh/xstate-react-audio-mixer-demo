import { createActor } from 'xstate'
import { mixerMachine } from '../machines'
import { useSelector } from '@xstate/react'

export const mixerActor = createActor(mixerMachine)

mixerActor.start()
mixerActor.subscribe((snapshot) => {
  console.log(snapshot.value)
})

export const useMixer = () => ({
  trackRefs: useSelector(mixerActor, (snapshot) => snapshot.context.trackRefs),
  trackCount: useSelector(
    mixerActor,
    (snapshot) => snapshot.context.trackRefs.length,
  ),
  send: mixerActor.send,
})
