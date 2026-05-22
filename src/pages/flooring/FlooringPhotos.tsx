import PhotosTab from '../../components/PhotosTab';
import type { FlooringPhotos as FP, FlooringMeasurements } from '../../types';

interface Props {
  data: FP;
  measurements: FlooringMeasurements;
  assessmentId: string;
  jobId: string;
  onUpdate: (d: FP) => void;
}

export default function FlooringPhotos({ data, measurements, assessmentId, jobId, onUpdate }: Props) {
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
