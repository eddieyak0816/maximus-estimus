import PhotosTab from '../../components/PhotosTab';
import type { BathroomPhotos as BP, BathroomMeasurements } from '../../types';

interface Props {
  data: BP;
  measurements: BathroomMeasurements;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: BP) => void;
}

export default function BathroomPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
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
