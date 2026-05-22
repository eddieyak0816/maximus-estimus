import PhotosTab from '../../components/PhotosTab';
import type { LivingRoomPhotos as LP, LivingRoomMeasurements } from '../../types';

interface Props {
  data: LP;
  measurements: LivingRoomMeasurements;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: LP) => void;
}

export default function LivingRoomPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
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
