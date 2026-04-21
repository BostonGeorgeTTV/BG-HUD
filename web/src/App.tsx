import { useEffect, useMemo, useRef, useState } from 'react'
import VehicleCompass from './components/VehicleCompass'
import {
  Brain,
  CarFront,
  ChevronDown,
  Droplets,
  Heart,
  Mic,
  Move,
  PersonStanding,
  Shield,
  UtensilsCrossed,
  Wind,
  X
} from 'lucide-react'
import { useNuiEvent } from './hooks/useNuiEvent'
import type {
  HudColors,
  HudConfig,
  HudData,
  HudSettings,
  MinimapMode,
  StatusStyle,
  VehicleHudStyle
} from './types'
import VehicleHudRenderer from './components/VehicleHudRenderer'
import { playSeatbeltSound } from './sounds/SeatBeltSounds'

const defaultSettings: HudSettings = {
  hudVisible: true,
  minimapMode: 'always',
  showServerId: true,
  showHealth: true,
  showArmor: true,
  showHunger: true,
  showThirst: true,
  showStress: true,
  showStamina: true,
  showOxygen: true,
  showMic: true,
  onlyShowOxygenUnderwater: true,
  cinematicMode: false,
  scale: 1,
  x: 1.25,
  y: 1.15,
  serverIdScale: 1,
  serverIdX: 2.2,
  serverIdY: 6.6,
  statusStyle: 'hex',
  showStatusPercentage: true,
  showVehicleHud: true,
  showCompass: true,
  compassScale: 1,
  compassX: 0,
  compassY: 0,
  compassAttachToMinimap: false,
  vehicleHudStyle: 'semicircle',
  vehicleScale: 1,
  vehicleX: 1.8,
  vehicleY: 1.25,
  colors: {
    health: '#ff5b67',
    armor: '#96a3b7',
    hunger: '#e6be5a',
    thirst: '#57e682',
    stress: '#dc72ff',
    stamina: '#d0d5dc',
    oxygen: '#67d2ff',
    serverId: '#67d2ff',
    serverIdText: '#ffffff',
    micWhisper: '#96a3b7',
    micNormal: '#57e682',
    micShout: '#dc72ff',
    micTalking: '#ff3434'
  }
}

function normalizeSettings(settings?: Partial<HudSettings> | null): HudSettings {
  const minimapMode: MinimapMode =
    typeof settings?.minimapMode === 'string'
      ? settings.minimapMode
      : (settings as { minimapVisible?: boolean } | null | undefined)?.minimapVisible === false
        ? 'disabled'
        : 'always'

  return {
    ...defaultSettings,
    ...settings,
    minimapMode
  }
}

const defaultConfig: HudConfig = {
  cinematicBars: {
    enabled: true,
    height: '10vh'
  },
  logo: {
    enabled: true,
    url: '',
    localPath: '',
    width: 180,
    top: '2.2rem',
    right: '2.2rem'
  }
}

const defaultHud: HudData = {
  visible: true,
  serverId: 0,
  health: 100,
  armor: 0,
  stamina: 100,
  oxygen: 100,
  hunger: 100,
  thirst: 100,
  stress: 0,
  mic: false,
  voiceMode: 2,
  settings: defaultSettings,
  config: defaultConfig,
  vehicle: {
    inVehicle: false,
    speed: 0,
    rpm: 0,
    fuel: 0,
    gear: 0,
    engineHealth: 1000,
    bodyHealth: 1000,
    lightsOn: false,
    seatbeltOn: false,
    kmh: true,
    vehicleClass: 0,
    heading: 0,
    street1: '',
    street2: '',
    mileage: 0,
    mileageUnit: 'kilometers'
  }
}

type StatusItem = {
  key: string
  icon: React.ReactNode
  value: number
  color: string
  visible: boolean
  dim?: boolean
  pulse?: boolean
  voiceMode?: number
  talking?: boolean
}

type DragTarget = 'status' | 'serverId' | 'vehicle' | null
type SettingsSection = 'general' | 'elements' | 'vehicle' | 'colors' | 'mic'

function hexToRgbString(hex: string): string {
  const clean = hex.replace('#', '')
  const normalized =
    clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean

  const int = parseInt(normalized, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `${r}, ${g}, ${b}`
}

async function postNui<T>(event: string, data?: unknown): Promise<T | void> {
  const resource =
    (window as Window & { GetParentResourceName?: () => string })
      .GetParentResourceName?.() ?? 'bg_hud'

  const response = await fetch(`https://${resource}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data ?? {})
  })

  try {
    return await response.json()
  } catch {
    return
  }
}

function Shape({
  style,
  progress
}: {
  style: StatusStyle
  progress: number
}) {
  if (style === 'circle') {
    const radius = 21
    const circumference = 2 * Math.PI * radius
    const dash = (progress / 100) * circumference

    return (
      <svg className="status-svg" viewBox="0 0 64 64" aria-hidden="true">
        <circle className="shape-track" cx="32" cy="32" r="21" />
        <circle
          className="shape-progress"
          cx="32"
          cy="32"
          r="21"
          style={{ strokeDasharray: `${dash} ${circumference}` }}
        />
        <circle className="shape-inner-circle" cx="32" cy="32" r="16.5" />
      </svg>
    )
  }

  if (style === 'square') {
    const perimeter = 168
    const dash = (progress / 100) * perimeter

    return (
      <svg className="status-svg" viewBox="0 0 64 64" aria-hidden="true">
        <rect
          className="shape-track"
          x="10"
          y="10"
          width="44"
          height="44"
          rx="12"
          ry="12"
          pathLength={perimeter}
        />
        <rect
          className="shape-progress"
          x="10"
          y="10"
          width="44"
          height="44"
          rx="12"
          ry="12"
          pathLength={perimeter}
          style={{ strokeDasharray: `${dash} ${perimeter}` }}
        />
        <rect
          className="shape-inner-square"
          x="16"
          y="16"
          width="32"
          height="32"
          rx="9"
          ry="9"
        />
      </svg>
    )
  }

  const perimeter = 176
  const dash = (progress / 100) * perimeter

  return (
    <svg className="status-svg" viewBox="0 0 64 64" aria-hidden="true">
      <polygon
        className="shape-track"
        points="32,7 53,18 53,42 32,53 11,42 11,18"
        pathLength={perimeter}
      />
      <polygon
        className="shape-progress"
        points="32,7 53,18 53,42 32,53 11,42 11,18"
        pathLength={perimeter}
        style={{ strokeDasharray: `${dash} ${perimeter}` }}
      />
      <polygon
        className="shape-inner-hex"
        points="32,11 47.8,19.6 47.8,40.4 32,49 16.2,40.4 16.2,19.6"
      />
    </svg>
  )
}

function StatusBadge({
  style,
  icon,
  value,
  color,
  dim = false,
  pulse = false,
  voiceMode,
  talking = false,
  showValue = false
}: {
  style: StatusStyle
  icon: React.ReactNode
  value: number
  color: string
  dim?: boolean
  pulse?: boolean
  voiceMode?: number
  talking?: boolean
  showValue?: boolean
}) {
  const progress = Math.round(Math.max(0, Math.min(100, value)))
  const accent = talking ? '#ff3434' : color
  const accentRgb = hexToRgbString(accent)

  if (style === 'bar') {
    return (
      <div
        className={`status-item style-${style} ${dim ? 'is-dimmed' : ''} ${pulse ? 'is-pulse' : ''} ${talking ? 'is-talking' : ''}`}
        style={
          {
            ['--accent' as string]: accent,
            ['--accent-rgb' as string]: accentRgb,
            ['--progress' as string]: `${progress}%`
          } as React.CSSProperties
        }
      >
        <div className="status-icon">{icon}</div>
        <div className="status-bar-shell">
          <div className="status-bar-fill" />
        </div>

        {showValue && <div className="status-percentage">{progress}%</div>}

        {typeof voiceMode === 'number' && (
          <div className={`voice-bars voice-${voiceMode}`}>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`status-item style-${style} ${dim ? 'is-dimmed' : ''} ${pulse ? 'is-pulse' : ''} ${talking ? 'is-talking' : ''}`}
      style={
        {
          ['--accent' as string]: accent,
          ['--accent-rgb' as string]: accentRgb
        } as React.CSSProperties
      }
    >
      <Shape style={style} progress={progress} />
      <div className="status-icon">{icon}</div>

      {showValue && <div className="status-percentage">{progress}%</div>}

      {typeof voiceMode === 'number' && (
        <div className={`voice-bars voice-${voiceMode}`}>
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  )
}


function ServerIdBadge({
  style,
  serverId,
  color,
  textColor
}: {
  style: StatusStyle
  serverId: number
  color: string
  textColor: string
}) {
  const accentRgb = hexToRgbString(color)

  if (style === 'bar') {
    return (
      <div
        className="server-id-status server-id-style-bar"
        style={
          {
            ['--accent' as string]: color,
            ['--accent-rgb' as string]: accentRgb,
            ['--server-id-text' as string]: textColor
          } as React.CSSProperties
        }
      >
        <div className="server-id-bar-label">ID</div>
        <div className="server-id-bar-shell">
          <div className="server-id-bar-fill">
            <span className="server-id-value">{serverId}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`server-id-status style-${style}`}
      style={
        {
          ['--accent' as string]: color,
          ['--accent-rgb' as string]: accentRgb,
          ['--server-id-text' as string]: textColor
        } as React.CSSProperties
      }
    >
      <Shape style={style} progress={100} />
      <div className="server-id-shape-content">
        <span className="server-id-shape-label">ID</span>
        <span className="server-id-value">{serverId}</span>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="settings-row">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <label className="settings-row">
      <span>{label}</span>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: '14rem',
          justifyContent: 'flex-end'
        }}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '9rem' }}
        />

        <span
          style={{
            minWidth: '3.5rem',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {value}
        </span>
      </div>
    </label>
  )
}

function ColorRow({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="settings-row">
      <span>{label}</span>
      <input
        className="color-input"
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function SelectRow<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: T
  options: { label: string; value: T }[]
  onChange: (value: T) => void
}) {
  return (
    <label className="settings-row">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Section({
  title,
  section,
  openSection,
  setOpenSection,
  children
}: {
  title: string
  section: SettingsSection
  openSection: SettingsSection | null
  setOpenSection: (value: SettingsSection | null) => void
  children: React.ReactNode
}) {
  const open = openSection === section

  return (
    <section className={`settings-section ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="section-toggle"
        onClick={() => setOpenSection(open ? null : section)}
      >
        <span>{title}</span>
        <ChevronDown size={16} className={open ? 'rotated' : ''} />
      </button>

      {open && <div className="section-content">{children}</div>}
    </section>
  )
}

function SettingsPanel({
  open,
  settings,
  onClose,
  onPreview,
  onSave,
  onReset
}: {
  open: boolean
  settings: HudSettings
  onClose: () => void
  onPreview: (settings: HudSettings) => void
  onSave: (settings: HudSettings) => void
  onReset: () => void
}) {
  const [draft, setDraft] = useState<HudSettings>(settings)
  const [openSection, setOpenSection] = useState<SettingsSection | null>('general')

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  if (!open) return null

  const updateDraft = (next: HudSettings) => {
    setDraft(next)
    onPreview(next)
  }

  const setColor = (key: keyof HudColors, value: string) => {
    updateDraft({
      ...draft,
      colors: {
        ...draft.colors,
        [key]: value
      }
    })
  }

  return (
    <div className="settings-panel centered-panel">
      <div className="settings-header pro-header">
        <div className="settings-header-left">
          <div className="panel-badge">MENU HUD</div>
          <div>
            <h2>Personalizza il tuo HUD</h2>
            <p>Trascina HUD, badge ID e speedometer, usa la rotella per la scala.</p>
          </div>
        </div>

        <button className="icon-button close-button" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="settings-tabs">
        <button type="button" className="settings-tab active">HUD</button>
        <button type="button" className="settings-tab">SETTINGS</button>
      </div>

      <div className="settings-sections compact-sections">
        <Section
          title="Generale"
          section="general"
          openSection={openSection}
          setOpenSection={setOpenSection}
        >
          <ToggleRow label="HUD visibile" checked={draft.hudVisible} onChange={(v) => updateDraft({ ...draft, hudVisible: v })} />
          <SelectRow<MinimapMode>
            label="Modalità minimappa"
            value={draft.minimapMode}
            options={[
              { label: 'Solo a piedi', value: 'on_foot' },
              { label: 'Solo nel veicolo', value: 'in_vehicle' },
              { label: 'Sempre attiva', value: 'always' },
              { label: 'Sempre disattivata', value: 'disabled' }
            ]}
            onChange={(v) => updateDraft({ ...draft, minimapMode: v })}
          />
          <ToggleRow label="Mostra badge ID server" checked={draft.showServerId} onChange={(v) => updateDraft({ ...draft, showServerId: v })} />
          <ToggleRow label="Oxygen solo sott’acqua" checked={draft.onlyShowOxygenUnderwater} onChange={(v) => updateDraft({ ...draft, onlyShowOxygenUnderwater: v })} />
          <ToggleRow label="Modalità cinematica" checked={draft.cinematicMode} onChange={(v) => updateDraft({ ...draft, cinematicMode: v })} />

          <SelectRow<StatusStyle>
            label="Stile status"
            value={draft.statusStyle}
            options={[
              { label: 'Esagono', value: 'hex' },
              { label: 'Quadrato', value: 'square' },
              { label: 'Cerchio', value: 'circle' },
              { label: 'Barra', value: 'bar' }
            ]}
            onChange={(v) => updateDraft({ ...draft, statusStyle: v })}
          />

          <ToggleRow
            label="Mostra percentuale status"
            checked={draft.showStatusPercentage}
            onChange={(v) => updateDraft({ ...draft, showStatusPercentage: v })}
          />
        </Section>

        <Section
          title="Elementi"
          section="elements"
          openSection={openSection}
          setOpenSection={setOpenSection}
        >
          <ToggleRow label="Health" checked={draft.showHealth} onChange={(v) => updateDraft({ ...draft, showHealth: v })} />
          <ToggleRow label="Armor" checked={draft.showArmor} onChange={(v) => updateDraft({ ...draft, showArmor: v })} />
          <ToggleRow label="Hunger" checked={draft.showHunger} onChange={(v) => updateDraft({ ...draft, showHunger: v })} />
          <ToggleRow label="Thirst" checked={draft.showThirst} onChange={(v) => updateDraft({ ...draft, showThirst: v })} />
          <ToggleRow label="Stress" checked={draft.showStress} onChange={(v) => updateDraft({ ...draft, showStress: v })} />
          <ToggleRow label="Stamina" checked={draft.showStamina} onChange={(v) => updateDraft({ ...draft, showStamina: v })} />
          <ToggleRow label="Oxygen" checked={draft.showOxygen} onChange={(v) => updateDraft({ ...draft, showOxygen: v })} />
          <ToggleRow label="Microfono" checked={draft.showMic} onChange={(v) => updateDraft({ ...draft, showMic: v })} />
        </Section>

        <Section
          title="Speedometer"
          section="vehicle"
          openSection={openSection}
          setOpenSection={setOpenSection}
        >
          <ToggleRow label="Mostra speedometer" checked={draft.showVehicleHud} onChange={(v) => updateDraft({ ...draft, showVehicleHud: v })} />
          <ToggleRow
            label="Mostra bussola"
            checked={draft.showCompass}
            onChange={(v) => updateDraft({ ...draft, showCompass: v })}
          />

          {draft.showCompass && (
            <>
              <ToggleRow
                label="Aggancia bussola alla minimap"
                checked={draft.compassAttachToMinimap}
                onChange={(v) => updateDraft({ ...draft, compassAttachToMinimap: v })}
              />

              <SliderRow
                label="Scala bussola"
                min={0.6}
                max={2}
                step={0.05}
                value={draft.compassScale}
                onChange={(v) => updateDraft({ ...draft, compassScale: v })}
              />

              <SliderRow
                label="Bussola X"
                min={-30}
                max={30}
                step={0.1}
                value={draft.compassX}
                onChange={(v) => updateDraft({ ...draft, compassX: v })}
              />

              <SliderRow
                label="Bussola Y"
                min={-20}
                max={20}
                step={0.1}
                value={draft.compassY}
                onChange={(v) => updateDraft({ ...draft, compassY: v })}
              />
            </>
          )}
          
          <SelectRow<VehicleHudStyle>
            label="Stile speedometer"
            value={draft.vehicleHudStyle}
            options={[
              { label: 'Semicircle', value: 'semicircle' },
              { label: 'TimeBomb', value: 'timebomb' },
              { label: 'RaceV2', value: 'racev2' },
              { label: 'BMG', value: 'bmg' },
              { label: 'ClassicOld', value: 'classicold' },
              { label: 'Globe', value: 'globe' },
              { label: 'GMG', value: 'gmg' },
              { label: 'GrtOne', value: 'grtone' },
              { label: 'GrtTwo', value: 'grttwo' },
              { label: 'HudV2', value: 'hudv2' }
            ]}
            onChange={(v) => updateDraft({ ...draft, vehicleHudStyle: v })}
          />
        </Section>

        <Section
          title="Colori status"
          section="colors"
          openSection={openSection}
          setOpenSection={setOpenSection}
        >
          <ColorRow label="Health" value={draft.colors.health} onChange={(v) => setColor('health', v)} />
          <ColorRow label="Armor" value={draft.colors.armor} onChange={(v) => setColor('armor', v)} />
          <ColorRow label="Hunger" value={draft.colors.hunger} onChange={(v) => setColor('hunger', v)} />
          <ColorRow label="Thirst" value={draft.colors.thirst} onChange={(v) => setColor('thirst', v)} />
          <ColorRow label="Stress" value={draft.colors.stress} onChange={(v) => setColor('stress', v)} />
          <ColorRow label="Stamina" value={draft.colors.stamina} onChange={(v) => setColor('stamina', v)} />
          <ColorRow label="Oxygen" value={draft.colors.oxygen} onChange={(v) => setColor('oxygen', v)} />
          <ColorRow label="ID server" value={draft.colors.serverId} onChange={(v) => setColor('serverId', v)} />
          <ColorRow label="Testo ID server" value={draft.colors.serverIdText} onChange={(v) => setColor('serverIdText', v)} />
        </Section>

        <Section
          title="Colori microfono"
          section="mic"
          openSection={openSection}
          setOpenSection={setOpenSection}
        >
          <ColorRow label="Whisper" value={draft.colors.micWhisper} onChange={(v) => setColor('micWhisper', v)} />
          <ColorRow label="Normal" value={draft.colors.micNormal} onChange={(v) => setColor('micNormal', v)} />
          <ColorRow label="Shout" value={draft.colors.micShout} onChange={(v) => setColor('micShout', v)} />
          <ColorRow label="Talking" value={draft.colors.micTalking} onChange={(v) => setColor('micTalking', v)} />
        </Section>
      </div>

      <div className="settings-footer">
        <button className="secondary-button" onClick={onReset}>Reset</button>
        <button className="primary-button" onClick={() => onSave(draft)}>Salva</button>
      </div>
    </div>
  )
}

function resolveLogoSrc(logo?: HudConfig['logo']) {
  if (!logo?.enabled) return ''

  if (logo.localPath && logo.localPath.trim() !== '') {
    return logo.localPath
  }

  return logo.url || ''
}

export default function App() {
  const [hud, setHud] = useState<HudData>(defaultHud)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsDraft, setSettingsDraft] = useState<HudSettings>(defaultSettings)

  const settingsRef = useRef<HudSettings>(defaultSettings)
  const activeDragRef = useRef<DragTarget>(null)
  const previousSeatbeltRef = useRef<boolean | null>(null)
  const dragStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0
  })

  useEffect(() => {
    settingsRef.current = hud.settings
  }, [hud.settings])

  useNuiEvent<HudData>('updateHud', (data) => {
    setHud((prev) => {
      const keepLocalSettings = settingsOpen || activeDragRef.current !== null

      return {
        ...data,
        settings: keepLocalSettings ? prev.settings : data.settings
      }
    })

    if (!settingsOpen && activeDragRef.current === null) {
      setSettingsDraft(data.settings)
      settingsRef.current = data.settings
    }
  })

  useEffect(() => {
    const current = hud.vehicle.seatbeltOn
    const previous = previousSeatbeltRef.current

    if (previous !== null && previous !== current && hud.vehicle.inVehicle) {
      playSeatbeltSound(current)
    }

    previousSeatbeltRef.current = current
  }, [hud.vehicle.inVehicle, hud.vehicle.seatbeltOn])

  useNuiEvent<HudSettings>('openSettings', (settings) => {
    settingsRef.current = settings
    setSettingsDraft(settings)
    setHud((prev) => ({
      ...prev,
      settings
    }))
    setSettingsOpen(true)
  })

  const previewSettings = async (settings: HudSettings) => {
    settingsRef.current = settings
    setHud((prev) => ({ ...prev, settings }))
    setSettingsDraft(settings)
    await postNui('previewSettings', settings)
  }

  const items = useMemo<StatusItem[]>(() => {
    const colors = hud.settings.colors
    const oxygenVisible =
      hud.settings.showOxygen &&
      (!hud.settings.onlyShowOxygenUnderwater || hud.oxygen < 100)

    const voiceMode = hud.voiceMode <= 1 ? 1 : hud.voiceMode >= 3 ? 3 : 2

    const micColor =
      voiceMode === 1 ? colors.micWhisper :
      voiceMode === 2 ? colors.micNormal :
      colors.micShout

    const list: StatusItem[] = [
      {
        key: 'health',
        icon: <Heart size={14} strokeWidth={2.15} />,
        value: hud.health,
        color: colors.health,
        visible: hud.settings.showHealth,
        pulse: hud.health <= 20
      },
      {
        key: 'armor',
        icon: <Shield size={14} strokeWidth={2.15} />,
        value: hud.armor,
        color: colors.armor,
        visible: hud.settings.showArmor,
        dim: hud.armor <= 0
      },
      {
        key: 'hunger',
        icon: <UtensilsCrossed size={14} strokeWidth={2.05} />,
        value: hud.hunger,
        color: colors.hunger,
        visible: hud.settings.showHunger
      },
      {
        key: 'thirst',
        icon: <Droplets size={14} strokeWidth={2.15} />,
        value: hud.thirst,
        color: colors.thirst,
        visible: hud.settings.showThirst
      },
      {
        key: 'stamina',
        icon: <PersonStanding size={14} strokeWidth={2.15} />,
        value: hud.stamina,
        color: colors.stamina,
        visible: hud.settings.showStamina
      },
      {
        key: 'stress',
        icon: <Brain size={14} strokeWidth={2.15} />,
        value: hud.stress,
        color: colors.stress,
        visible: hud.settings.showStress
      }
    ]

    if (oxygenVisible) {
      list.push({
        key: 'oxygen',
        icon: <Wind size={14} strokeWidth={2.15} />,
        value: hud.oxygen,
        color: colors.oxygen,
        visible: true
      })
    }

    if (hud.settings.showMic) {
      list.push({
        key: 'mic',
        icon: <Mic size={14} strokeWidth={2.15} />,
        value: voiceMode === 1 ? 33 : voiceMode === 2 ? 66 : 100,
        color: micColor,
        visible: true,
        pulse: hud.mic,
        voiceMode,
        talking: hud.mic
      })
    }

    return list.filter((item) => item.visible)
  }, [hud])

  const handleCloseSettings = async () => {
    activeDragRef.current = null
    setSettingsOpen(false)
    await postNui('closeSettings')
  }

  const handleSaveSettings = async (settings: HudSettings) => {
    const result = await postNui<{ ok: boolean; settings: HudSettings }>('saveSettings', settings)
    if (result?.settings) {
      settingsRef.current = result.settings
      setHud((prev) => ({ ...prev, settings: result.settings }))
      setSettingsDraft(result.settings)
    }
    setSettingsOpen(false)
    await postNui('closeSettings')
  }

  const handleResetSettings = async () => {
    const result = await postNui<{ ok: boolean; settings: HudSettings }>('resetSettings')
    if (result?.settings) {
      settingsRef.current = result.settings
      setHud((prev) => ({ ...prev, settings: result.settings }))
      setSettingsDraft(result.settings)
    }
  }

  const beginDrag = (target: DragTarget, event: React.PointerEvent<HTMLDivElement>) => {
    if (!settingsOpen || !target) return

    activeDragRef.current = target
    dragStartRef.current = {
      mouseX: event.clientX,
      mouseY: event.clientY,
      startX:
        target === 'status'
          ? settingsRef.current.x
          : target === 'serverId'
            ? settingsRef.current.serverIdX
            : settingsRef.current.vehicleX,
      startY:
        target === 'status'
          ? settingsRef.current.y
          : target === 'serverId'
            ? settingsRef.current.serverIdY
            : settingsRef.current.vehicleY
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!activeDragRef.current) return

      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const dx = (event.clientX - dragStartRef.current.mouseX) / rem
      const dy = (dragStartRef.current.mouseY - event.clientY) / rem

      let nextSettings: HudSettings

      if (activeDragRef.current === 'status') {
        nextSettings = {
          ...settingsRef.current,
          x: Number((dragStartRef.current.startX + dx).toFixed(2)),
          y: Number((dragStartRef.current.startY + dy).toFixed(2))
        }
      } else if (activeDragRef.current === 'serverId') {
        nextSettings = {
          ...settingsRef.current,
          serverIdX: Number((dragStartRef.current.startX - dx).toFixed(2)),
          serverIdY: Number((dragStartRef.current.startY - dy).toFixed(2))
        }
      } else {
        nextSettings = {
          ...settingsRef.current,
          vehicleX: Number((dragStartRef.current.startX - dx).toFixed(2)),
          vehicleY: Number((dragStartRef.current.startY + dy).toFixed(2))
        }
      }

      settingsRef.current = nextSettings
      setSettingsDraft(nextSettings)
      setHud((prev) => ({
        ...prev,
        settings: nextSettings
      }))
    }

    const handlePointerUp = () => {
      if (!activeDragRef.current) return
      activeDragRef.current = null
      void postNui('previewSettings', settingsRef.current)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  const updateScale = (target: DragTarget, deltaY: number) => {
    if (!settingsOpen || !target) return

    const delta = deltaY > 0 ? -0.02 : 0.02
    const current = settingsRef.current

    const nextSettings: HudSettings =
      target === 'status'
        ? {
            ...current,
            scale: Math.min(1.5, Math.max(0.7, Number((current.scale + delta).toFixed(2))))
          }
        : target === 'serverId'
          ? {
              ...current,
              serverIdScale: Math.min(1.8, Math.max(0.7, Number((current.serverIdScale + delta).toFixed(2))))
            }
          : {
              ...current,
              vehicleScale: Math.min(1.6, Math.max(0.6, Number((current.vehicleScale + delta).toFixed(2))))
            }

    settingsRef.current = nextSettings
    setHud((prev) => ({ ...prev, settings: nextSettings }))
    setSettingsDraft(nextSettings)
    void postNui('previewSettings', nextSettings)
  }

  const cinematicBarsEnabled = !!hud.settings.cinematicMode && !!hud.config?.cinematicBars?.enabled
  const cinematicBarHeight = hud.config?.cinematicBars?.height || '10vh'
  const logoConfig = hud.config?.logo
  const logoSrc = resolveLogoSrc(logoConfig)
  const showLogo = !!logoConfig?.enabled && !!logoSrc && !settingsOpen

  const getCompassStyle = () => {
    const s = hud.settings

    if (s.compassAttachToMinimap) {
      return {
        position: 'fixed' as const,
        left: `calc(12rem + ${s.compassX}rem)`,
        bottom: `calc(7.8rem + ${s.compassY}rem)`,
        transform: `translateX(-50%) scale(${s.compassScale})`,
        transformOrigin: 'center bottom',
        zIndex: 20,
        pointerEvents: 'none' as const
      }
    }

    return {
      position: 'fixed' as const,
      left: `calc(50% + ${s.compassX}rem)`,
      bottom: `calc(8rem + ${s.compassY}rem)`,
      transform: `translateX(-50%) scale(${s.compassScale})`,
      transformOrigin: 'center bottom',
      zIndex: 20,
      pointerEvents: 'none' as const
    }
  }

  return (
    <>
      {cinematicBarsEnabled && (
        <div className="cinematic-overlay" aria-hidden="true">
          <div className="cinematic-bar cinematic-bar-top" style={{ height: cinematicBarHeight }} />
          <div className="cinematic-bar cinematic-bar-bottom" style={{ height: cinematicBarHeight }} />
        </div>
      )}

      {showLogo && (
        <div
          className="hud-logo"
          style={{
            top: logoConfig?.top || '2.2rem',
            right: logoConfig?.right || '2.2rem'
          }}
        >
          <img
            src={logoSrc}
            alt="Server logo"
            style={{ width: `${logoConfig?.width || 180}px` }}
          />
        </div>
      )}

      {hud.visible && hud.settings.showServerId && (
        <div
          className={`server-id-root ${settingsOpen ? 'is-editing' : ''}`}
          style={{
            transform: `scale(${hud.settings.serverIdScale})`,
            right: `${hud.settings.serverIdX}rem`,
            top: `${hud.settings.serverIdY}rem`
          }}
          onPointerDown={(e) => beginDrag('serverId', e)}
          onWheel={(e) => updateScale('serverId', e.deltaY)}
        >
          {settingsOpen && (
            <div className="server-id-edit-hint drag-handle">
              <Move size={14} />
              <span>Badge ID server</span>
            </div>
          )}

          <ServerIdBadge
            style={hud.settings.statusStyle}
            serverId={hud.serverId}
            color={hud.settings.colors.serverId}
            textColor={hud.settings.colors.serverIdText}
          />
        </div>
      )}

      {hud.visible && (
        <div
          className={`hud-root ${settingsOpen ? 'is-editing' : ''}`}
          style={{
            transform: `scale(${hud.settings.scale})`,
            left: `${hud.settings.x}rem`,
            bottom: `${hud.settings.y}rem`
          }}
          onPointerDown={(e) => beginDrag('status', e)}
          onWheel={(e) => updateScale('status', e.deltaY)}
        >
          {settingsOpen && (
            <div className="hud-edit-hint drag-handle">
              <Move size={14} />
              <span>Status HUD</span>
            </div>
          )}

          <div className="status-bar">
            {items.map((item) => (
              <StatusBadge
                key={item.key}
                style={hud.settings.statusStyle}
                icon={item.icon}
                value={item.value}
                color={item.color}
                dim={item.dim}
                pulse={item.pulse}
                voiceMode={item.voiceMode}
                talking={item.talking}
                showValue={hud.settings.showStatusPercentage}
              />
            ))}
          </div>
        </div>
      )}

      {hud.settings.showCompass && hud.vehicle.inVehicle && (
        <div style={getCompassStyle()}>
          <VehicleCompass
            heading={hud.vehicle.heading}
            street1={hud.vehicle.street1}
            street2={hud.vehicle.street2}
          />
        </div>
      )}

      {hud.settings.showVehicleHud && hud.vehicle.inVehicle && (
        <div
          className={`vehicle-hud-root ${settingsOpen ? 'is-editing' : ''}`}
          style={{
            transform: `scale(${hud.settings.vehicleScale})`,
            right: `${hud.settings.vehicleX}rem`,
            bottom: `${hud.settings.vehicleY}rem`
          }}
          onPointerDown={(e) => beginDrag('vehicle', e)}
          onWheel={(e) => updateScale('vehicle', e.deltaY)}
        >
          {settingsOpen && (
            <div className="vehicle-edit-hint drag-handle">
              <CarFront size={14} />
              <span>Speedometer</span>
            </div>
          )}

          <VehicleHudRenderer
            style={hud.settings.vehicleHudStyle}
            vehicle={hud.vehicle}
            showCompass={false}
          />
        </div>
      )}

      <SettingsPanel
        open={settingsOpen}
        settings={settingsDraft}
        onClose={handleCloseSettings}
        onPreview={previewSettings}
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
      />
    </>
  )
}