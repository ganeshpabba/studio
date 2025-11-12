import type { SVGProps } from 'react';
import { Camera } from 'lucide-react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
    <div className="p-2 bg-primary/20 rounded-lg">
      <Camera className="w-8 h-8 text-primary" />
    </div>
);
