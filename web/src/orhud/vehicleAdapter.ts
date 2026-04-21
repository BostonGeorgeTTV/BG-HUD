import type { VehicleHudData } from '../types'
import type { iVehicleInfo } from './BasicTypes'

export function toOrHudVehicle(vehicle: VehicleHudData): iVehicleInfo {
  return {
    positions: { x: 0, y: 0 },
    entity: vehicle.inVehicle ? 1 : false,
    kmH: vehicle.kmh,
    speed: vehicle.speed,
    fuel: {
      level: Math.max(0, Math.min(100, Math.round(vehicle.fuel))),
      maxLevel: 100,
      type: 'gasoline'
    },
    currentGear:
      vehicle.gear === 0
        ? 'N'
        : vehicle.gear === -1
          ? 'R'
          : vehicle.gear,
    gearType: 'auto',
    rpm: Math.max(0, Math.min(1, vehicle.rpm)),
    engineHealth: vehicle.engineHealth,
    seatIndex: 0,
    isLightOn: vehicle.lightsOn,
    isTrunkOn: false,
    isHoodOn: false,
    isBackRightDoorOn: false,
    isBackLeftDoorOn: false,
    isFrontRightDoorOn: false,
    isFrontLeftDoorOn: false,
    isSeatbeltOn: vehicle.seatbeltOn,
    veh_class: vehicle.vehicleClass
  }
}