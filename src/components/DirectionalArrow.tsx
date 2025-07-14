import { Navigation } from "lucide-react";

interface DirectionalArrowProps {
  distance: number;
  angle: number;
  isNearChest: boolean;
}

export default function DirectionalArrow({
  distance,
  angle,
  isNearChest,
}: DirectionalArrowProps) {
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
      <div
        className={`glass-card p-4 rounded-full shadow-lg transition-all duration-200 ${
          isNearChest ? "bg-green-500/20" : ""
        }`}
        style={{
          transform: `rotate(${angle}deg)`,
        }}
      >
        <Navigation className="w-8 h-8 text-white" />
      </div>
      <p className="text-center text-white/80 mt-2">
        {Math.round(distance)}m away
      </p>
    </div>
  );
}
