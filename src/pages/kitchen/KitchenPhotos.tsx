import PhotosTab from '../../components/PhotosTab';
import type { KitchenPhotos as KP, KitchenMeasurements as KM } from '../../types';

interface Props {
  data: KP;
  measurements: KM;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: KP) => void;
}

export default function KitchenPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
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
