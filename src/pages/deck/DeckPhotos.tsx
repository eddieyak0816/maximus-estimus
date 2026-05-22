import PhotosTab from '../../components/PhotosTab';
import type { DeckPhotos as DP, DeckMeasurements } from '../../types';

interface Props {
  data: DP;
  measurements: DeckMeasurements;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: DP) => void;
}

export default function DeckPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
  return (
    <PhotosTab
      photos={data.photos || []}
      measurements={measurements}
      assessmentId={assessmentId}
      jobId={jobId}
      onUpdate={(photos) => onUpdate({ ...data, photos })}
    />
  );
}
