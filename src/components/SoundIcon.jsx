import React from 'react';
import { 
  Siren, 
  Clock, 
  Volume2, 
  AlertTriangle, 
  Radio, 
  Bell, 
  Zap, 
  Music, 
  Waves, 
  Sparkles 
} from 'lucide-react';

const SOUND_ICON_MAP = {
  siren: Siren,
  digital: Clock,
  klaxon: Volume2,
  meltdown: AlertTriangle,
  eas: Radio,
  bell: Bell,
  laser: Zap,
  bugle: Music,
  sonar: Waves,
  chime: Sparkles,
};

export default function SoundIcon({ id, size = 16, className = '' }) {
  const IconComponent = SOUND_ICON_MAP[id] || Bell;
  return <IconComponent size={size} className={className} />;
}
