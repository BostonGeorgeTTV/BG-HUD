export interface iVehicleInfo {
  positions: { x?: number; y?: number }
  entity: number | undefined | false
  kmH: boolean
  speed: number
  fuel: {
    level: number
    maxLevel: number
    type: 'gasoline' | 'electric'
  }
  currentGear: number | string
  gearType: 'auto' | 'manual'
  rpm: number
  engineHealth: number
  seatIndex: number
  isLightOn: boolean
  isTrunkOn: boolean
  isHoodOn: boolean
  isBackRightDoorOn: boolean
  isBackLeftDoorOn: boolean
  isFrontRightDoorOn: boolean
  isFrontLeftDoorOn: boolean
  isSeatbeltOn: boolean
  veh_class: number
}