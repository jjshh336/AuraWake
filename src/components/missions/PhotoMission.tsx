import { MissionConfig } from '../../types/alarm';
import { CameraMissionView } from './CameraMissionView';

interface PhotoMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

export function PhotoMission({ config, onComplete }: PhotoMissionProps) {
  return <CameraMissionView mode="photo" config={config} onComplete={onComplete} />;
}
