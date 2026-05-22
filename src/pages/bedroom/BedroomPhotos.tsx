import PhotosTab from '../../components/PhotosTab';
import type { BedroomPhotos as BP, BedroomMeasurements } from '../../types';

interface Props {
  data: BP;
  measurements: BedroomMeasurements;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: BP) => void;
}

export default function BedroomPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
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
