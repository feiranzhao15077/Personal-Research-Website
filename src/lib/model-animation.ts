export interface ModelAnimation {
  orbit: string;
  orbitDuration?: number;
  orbitNode?: string;
  assembly: string;
  assemblyStart: number;
  assemblyEnd: number;
  assemblyLabel?: string;
  assemblyReturnLabel?: string;
  assemblyView?: 'front' | 'underside';
  motion?: { clip: string; start: number; end: number; label: string };
}
