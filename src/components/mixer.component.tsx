import { Track } from ".";
import { useMixer } from "../lib";

export const Mixer = () => {
  const { trackRefs, trackCount, send } = useMixer();
  return (
    <div className="mixer">
      <div className="track-controls">
        <span className="track-count">
          {trackCount === 1 ? "1 track" : `${trackCount} tracks`}
        </span>
        <button onClick={() => send({ type: "mixer.addTrack" })}>
          Add a track
        </button>
        <button onClick={() => send({ type: "mixer.clearTracks" })}>
          Clear tracks
        </button>
      </div>
      <div className="tracks">
        {trackRefs.map((trackRef, index) => (
          <Track trackRef={trackRef.id} index={index} key={trackRef.id} />
        ))}
      </div>
    </div>
  );
};
