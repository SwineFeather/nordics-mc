
import { useParams } from 'react-router-dom';
import MapContainer from '@/components/map/MapContainer';

const Map = () => {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <MapContainer />
    </div>
  );
};

export default Map;
