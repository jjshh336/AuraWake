import { MissionConfig } from '../../types/alarm';
import { CameraMissionView } from './CameraMissionView';

interface QrMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

export function QrMission({ config, onComplete }: QrMissionProps) {
  return <CameraMissionView mode="qr" config={config} onComplete={onComplete} />;
}
