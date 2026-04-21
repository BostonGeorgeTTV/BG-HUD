import { iVehicleInfo } from "../../orhud/BasicTypes";
import SeatbeltIcon from './SeatbeltIcon'
import MileagePill from './MileagePill'

type TypeClassic = {
  veh: iVehicleInfo;
  mileage: number;
  mileageUnit: 'kilometers' | 'miles';
};

const ClassicOld = ({ veh, mileage, mileageUnit }: TypeClassic) => {

  const formatSpeed = (x: number): string => {
    return x?.toString()?.padStart(3, "0") || "000";
  };

  return (
    <div className="veh-hud-classic-old flex flex-col gap-1 relative items-center 4k:-translate-x-10 4k:-translate-y-3" style={{ width: 185 }}>
      <div className="flex items-center justify-between absolute w-full top-0">
        <h1 className="uppercase text-white/80 font-bold font-microgramma-d-extended">HBK</h1>
        <h1 className="uppercase text-white/80 font-bold font-microgramma-d-extended">ABS</h1>
      </div>
      <div className="mb-[18px] w-full flex items-center justify-center">
        <div
          className="transition-colors duration-300"
          style={{
            fontSize: 67,
            color: veh.speed > 100 ? "#FF013D" : "white",
          }}
        >
          <h1 className="font-bold font-microgramma-d-extended leading-normal">{formatSpeed(veh.speed)}</h1>
        </div>
      </div>
      <div className="absolute bottom-0 w-full flex flex-col gap-1.5">
        <div className="flex justify-between gap-1">
          <div className="h-7 bg-black/50 w-full flex items-center justify-center">
            <h1 className="text-FF013D font-bold font-microgramma-d-extended mt-0.5 uppercase">GEAR</h1>
          </div>
          <div className="min-w-7 min-h-7 bg-black/50 flex items-center justify-center">
            <h1 className="text-FF013D font-bold font-microgramma-d-extended mt-0.5">{veh.currentGear}</h1>
          </div>
          <div className="h-7 bg-white/15 w-full flex items-center justify-center">
            <h1 className="text-white font-bold font-microgramma-d-extended mt-0.5 uppercase">{veh.kmH ? "KMH" : "MPH"}</h1>
          </div>
        </div>
        <div className="relative bg-white/10 h-[3px] w-full overflow-hidden">
          <div className="absolute h-[3px] bg-white" style={{ width: veh.fuel.level + "%" }}></div>
        </div>
      </div>
      <MileagePill mileage={mileage} mileageUnit={mileageUnit} accent="#ff013d" compact style={{ left: -15, bottom: -40 }} />
      <div className="absolute -left-10 bottom-0">
        <SeatbeltIcon
          width={22}
          enabled={veh.isSeatbeltOn}
          hideWhenEnabled={false}
          enabledOpacity={1}
          disabledOpacity={0.5}
        />
      </div>
    </div>
  );
};

export default ClassicOld;
