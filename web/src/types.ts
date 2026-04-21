export type StatusStyle = 'hex' | 'square' | 'circle' | 'bar'

export type HudConfig = {
  cinematicBars?: {
    enabled?: boolean
    height?: string
  }
  logo?: {
    enabled?: boolean
    url?: string
    localPath?: string
    width?: number
    top?: string
    right?: string
  }
}

export type VehicleHudStyle =
  | 'semicircle'
  | 'timebomb'
  | 'racev2'
  | 'bmg'
  | 'classicold'
  | 'globe'
  | 'gmg'
  | 'grtone'
  | 'grttwo'
  | 'hudv2'

export type VehicleHudData = {
  inVehicle: boolean
  speed: number
  rpm: number
  fuel: number
  gear: string | number
  engineHealth: number
  bodyHealth: number
  lightsOn: boolean
  seatbeltOn: boolean
  kmh: boolean
  vehicleClass: number

  heading: number
  street1: string
  street2: string
  mileage: number
  mileageUnit: 'kilometers' | 'miles'
}

export type HudColors = {
  health: string
  armor: string
  hunger: string
  thirst: string
  stress: string
  stamina: string
  oxygen: string
  serverId: string
  serverIdText: string
  micWhisper: string
  micNormal: string
  micShout: string
  micTalking: string
}

export type MinimapMode = 'on_foot' | 'in_vehicle' | 'always' | 'disabled'

export type HudSettings = {
  hudVisible: boolean
  minimapMode: MinimapMode
  showServerId: boolean
  serverIdScale: number
  serverIdX: number
  serverIdY: number
  showHealth: boolean
  showArmor: boolean
  showHunger: boolean
  showThirst: boolean
  showStress: boolean
  showStamina: boolean
  showOxygen: boolean
  showMic: boolean
  onlyShowOxygenUnderwater: boolean
  cinematicMode: boolean
  scale: number
  x: number
  y: number
  statusStyle: StatusStyle
  showStatusPercentage: boolean
  colors: HudColors

  showVehicleHud: boolean
  showCompass: boolean
  compassScale: number
  compassX: number
  compassY: number
  compassAttachToMinimap: boolean
  vehicleHudStyle: VehicleHudStyle
  vehicleScale: number
  vehicleX: number
  vehicleY: number
}

export type HudData = {
  visible: boolean
  serverId: number
  health: number
  armor: number
  stamina: number
  oxygen: number
  hunger: number
  thirst: number
  stress: number
  mic: boolean
  voiceMode: number
  settings: HudSettings
  config?: HudConfig
  vehicle: VehicleHudData
}