import { iVehicleInfo } from "../../orhud/BasicTypes";
import SeatbeltIcon from './SeatbeltIcon'
import MileagePill from './MileagePill'

type TypeClassic = {
  veh: iVehicleInfo;
  mileage: number;
  mileageUnit: 'kilometers' | 'miles';
};

const TimeBomb = ({ veh, mileage, mileageUnit }: TypeClassic) => {

  const formatSpeed = (x: number): string => {
    return x?.toString()?.padStart(3, "0") || "000";
  };

  return (
    <div className="veh-hud-time-bomb flex flex-col gap-1 relative 4k:-translate-x-8 4k:-translate-y-2" style={{ width: 150 }}>
      <div className="mb-2 flex items-center justify-end">
        <h1 className="font-bold font-ticking-timebomb text-white leading-normal glow-text" style={{ fontSize: 81 }}>
          {formatSpeed(veh.speed)}
        </h1>
        <div className="flex flex-col mb-2 ml-2 text-2xl">
          <h1 className="uppercase text-white font-bold font-ticking-timebomb glow-text">HBK</h1>
          <h1 className="uppercase text-white font-bold font-ticking-timebomb glow-text">ABS</h1>
        </div>
      </div>
      <div className="absolute bottom-0 w-full flex flex-col">
        <div className="flex items-center justify-between gap-3 text-2xl w-max">
          <h1 className="text-FF013D font-bold font-ticking-timebomb uppercase glow-text">GEAR</h1>
          <h1 className="text-FF013D font-bold font-ticking-timebomb glow-text">{veh.currentGear}</h1>
          <h1 className="text-white font-bold font-ticking-timebomb uppercase glow-text">{veh.kmH ? "KMH" : "MPH"}</h1>
        </div>
        <MileagePill mileage={mileage} mileageUnit={mileageUnit} accent="#ff013d" compact style={{ left: -30, bottom: -40 }} />
        <div className="relative bg-white/10 h-[3px] w-full overflow-hidden">
          <div className="absolute h-[3px] bg-white" style={{ width: veh.fuel.level + "%" }}></div>
        </div>
        <div className="absolute -left-10 bottom-0">
          <SeatbeltIcon
            width={22}
            enabled={veh.isSeatbeltOn}
            enabledOpacity={1}
            disabledOpacity={0.5}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeBomb;
