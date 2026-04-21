import type { VehicleHudData, VehicleHudStyle } from '../types'
import { toOrHudVehicle } from '../orhud/vehicleAdapter'
import ShadowVehicleHud from '../orhud/ShadowVehicleHud'

import Bmg from './VehicleHud/Bmg'
import ClassicOld from './VehicleHud/ClassicOld'
import Globe from './VehicleHud/Globe'
import Gmg from './VehicleHud/Gmg'
import GrtOne from './VehicleHud/GrtOne'
import GrtTwo from './VehicleHud/GrtTwo'
import HudV2 from './VehicleHud/HudV2'
import RaceV2 from './VehicleHud/RaceV2'
import SemiCircle from './VehicleHud/SemiCircle'
import TimeBomb from './VehicleHud/TimeBomb'

type Props = {
  style: VehicleHudStyle
  vehicle: VehicleHudData
  showCompass: boolean
}

export default function VehicleHudRenderer({ style, vehicle, showCompass }: Props) {
  const veh = toOrHudVehicle(vehicle)
  const heading = showCompass ? vehicle.heading : 0

  let content: React.ReactNode

  switch (style) {
    case 'bmg':
      content = <Bmg veh={veh} heading={heading} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'classicold':
      content = <ClassicOld veh={veh} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'globe':
      content = <Globe veh={veh} heading={heading} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'gmg':
      content = <Gmg veh={veh} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'grtone':
      content = <GrtOne veh={veh} heading={heading} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'grttwo':
      content = <GrtTwo veh={veh} heading={heading} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'hudv2':
      content = <HudV2 veh={veh} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'racev2':
      content = <RaceV2 veh={veh} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'timebomb':
      content = <TimeBomb veh={veh} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
    case 'semicircle':
    default:
      content = <SemiCircle veh={veh} mileage={vehicle.mileage} mileageUnit={vehicle.mileageUnit} />
      break
  }

  return (
    <ShadowVehicleHud>
      <div className="vehicle-hud-shell">
        {content}
      </div>
    </ShadowVehicleHud>
  )
}
