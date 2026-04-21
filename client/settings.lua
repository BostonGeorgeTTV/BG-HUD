HudSettings = {}

local SETTINGS_KEY = 'bg_hud_settings'

local defaultSettings = {
    hudVisible = true,
    minimapMode = 'always',
    showServerId = true,

    showHealth = true,
    showArmor = true,
    showHunger = true,
    showThirst = true,
    showStress = true,
    showStamina = true,
    showOxygen = true,
    showMic = true,

    onlyShowOxygenUnderwater = true,
    cinematicMode = false,

    scale = 1.0,
    x = 1.25,
    y = 1.15,

    serverIdScale = 1.0,
    serverIdX = 2.2,
    serverIdY = 6.6,

    statusStyle = 'hex',
    showStatusPercentage = true,

    showVehicleHud = true,
    showCompass = true,
    compassScale = 1.0,
    compassX = 0.0,
    compassY = 0.0,
    compassAttachToMinimap = false,

    vehicleHudStyle = 'semicircle',
    vehicleScale = 1.0,
    vehicleX = 1.8,
    vehicleY = 1.25,

    colors = {
        health = '#ff5b67',
        armor = '#96a3b7',
        hunger = '#e6be5a',
        thirst = '#57e682',
        stress = '#dc72ff',
        stamina = '#d0d5dc',
        oxygen = '#67d2ff',
        serverId = '#67d2ff',
        serverIdText = '#ffffff',
        micWhisper = '#96a3b7',
        micNormal = '#57e682',
        micShout = '#dc72ff',
        micTalking = '#ff3434'
    }
}

local cachedSettings = nil


local function normalizeSettings(settings)
    if not settings then return end

    if settings.minimapMode == nil then
        if settings.minimapVisible == nil then
            settings.minimapMode = defaultSettings.minimapMode
        elseif settings.minimapVisible then
            settings.minimapMode = 'always'
        else
            settings.minimapMode = 'disabled'
        end
    end

    settings.minimapVisible = nil
end

local function deepCopy(tbl)
    local copy = {}
    for k, v in pairs(tbl) do
        if type(v) == 'table' then
            copy[k] = deepCopy(v)
        else
            copy[k] = v
        end
    end
    return copy
end

local function mergeDefaults(target, defaults)
    for key, value in pairs(defaults) do
        if type(value) == 'table' then
            if type(target[key]) ~= 'table' then
                target[key] = deepCopy(value)
            else
                mergeDefaults(target[key], value)
            end
        else
            if target[key] == nil then
                target[key] = value
            end
        end
    end
end

function HudSettings.Load()
    local raw = GetResourceKvpString(SETTINGS_KEY)

    if raw then
        local ok, decoded = pcall(json.decode, raw)
        if ok and decoded then
            cachedSettings = decoded
        end
    end

    if not cachedSettings then
        cachedSettings = deepCopy(defaultSettings)
        HudSettings.Save()
    end

    normalizeSettings(cachedSettings)
    mergeDefaults(cachedSettings, defaultSettings)
    return cachedSettings
end

function HudSettings.Get()
    if not cachedSettings then
        return HudSettings.Load()
    end
    return cachedSettings
end

function HudSettings.Save()
    if not cachedSettings then return end
    SetResourceKvp(SETTINGS_KEY, json.encode(cachedSettings))
end

function HudSettings.Replace(newSettings)
    cachedSettings = newSettings or deepCopy(defaultSettings)
    normalizeSettings(cachedSettings)
    normalizeSettings(cachedSettings)
    mergeDefaults(cachedSettings, defaultSettings)
    HudSettings.Save()
    return cachedSettings
end

function HudSettings.Preview(newSettings)
    cachedSettings = newSettings or deepCopy(defaultSettings)
    normalizeSettings(cachedSettings)
    mergeDefaults(cachedSettings, defaultSettings)
    return cachedSettings
end

function HudSettings.Reset()
    cachedSettings = deepCopy(defaultSettings)
    HudSettings.Save()
    return cachedSettings
end

RegisterCommand('settings', function()
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)

    SendNUIMessage({
        action = 'openSettings',
        data = HudSettings.Get()
    })
end, false)

RegisterCommand('hud', function()
    local settings = HudSettings.Get()
    settings.hudVisible = not settings.hudVisible
    HudSettings.Save()
    TriggerEvent('hex_hud:refreshSettings')
end, false)

RegisterNUICallback('previewSettings', function(data, cb)
    local settings = HudSettings.Preview(data)
    TriggerEvent('hex_hud:refreshSettings')
    cb({
        ok = true,
        settings = settings
    })
end)

RegisterNUICallback('saveSettings', function(data, cb)
    local settings = HudSettings.Replace(data)
    TriggerEvent('hex_hud:refreshSettings')
    cb({
        ok = true,
        settings = settings
    })
end)

RegisterNUICallback('resetSettings', function(_, cb)
    local settings = HudSettings.Reset()
    TriggerEvent('hex_hud:refreshSettings')
    cb({
        ok = true,
        settings = settings
    })
end)

RegisterNUICallback('closeSettings', function(_, cb)
    SetNuiFocus(false, false)
    HudSettings.Save()
    cb({ ok = true })
end)