import PhotosTab from '../../components/PhotosTab';
import type { PaintingPhotos as PP, PaintingMeasurements } from '../../types';

interface Props {
  data: PP;
  measurements: PaintingMeasurements;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: PP) => void;
}

export default function PaintingPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
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
