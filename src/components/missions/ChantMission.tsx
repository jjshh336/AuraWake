import { ChantMissionView, ChantMissionViewProps } from './ChantMissionView';
import { MissionConfig } from '../../types/alarm';

interface ChantMissionProps {
  config: MissionConfig;
  onComplete: () => void;
}

export function ChantMission({ config, onComplete }: ChantMissionProps) {
  return (
    <ChantMissionView
      config={config}
      targetPhrase={config.chantPhrase || config.customText || 'RADHA RADHA'}
      initialTargetCount={config.targetCount || 20}
      allowConfig={true}
      onComplete={onComplete}
    />
  );
}

export { ChantMissionView };
export type { ChantMissionViewProps };
