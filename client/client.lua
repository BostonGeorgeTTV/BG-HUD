local ESX = nil
local QBCore = nil
local Framework = 'standalone'

local pauseMenuHidden = false

local playerStatus = {
    health = 100,
    armor = 0,
    stamina = 100,
    oxygen = 100,
    hunger = 100,
    thirst = 100,
    stress = 0,
    mic = false,
    voiceMode = 2
}

local vehicleStatus = {
    inVehicle = false,
    speed = 0,
    rpm = 0,
    fuel = 0,
    gear = 0,
    engineHealth = 1000,
    bodyHealth = 1000,
    lightsOn = false,
    seatbeltOn = false,
    kmh = true,
    vehicleClass = 0,
    heading = 0,
    street1 = '',
    street2 = '',
    mileage = 0.0,
    mileageUnit = 'kilometers'
}

local seatbeltOn = false

local defaultEjectVelocity = (75.0)
local defaultUnknownEjectVelocity = (45.0)
local defaultUnknownModifier = 18.0
local defaultMinDamage = 0.0

-- Ejection state replicated from the source script logic
local newvehicleBodyHealth = 0.0
local currentvehicleBodyHealth = 0.0
local frameBodyChange = 0.0
local lastFrameVehiclespeed = 0.0
local lastFrameVehiclespeed2 = 0.0
local thisFrameVehicleSpeed = 0.0
local tick = 0
local veloc = vector3(0.0, 0.0, 0.0)

local seatbeltEjectThreadRunning = false

local mileageState = {
    lastVehicle = 0,
    lastPlate = nil,
    lastCoords = nil,
    currentMileage = 0.0,
    fetchedExistingMileage = false,
    lastSavedMileage = nil
}

local function normalizeFrameworkName(framework)
    framework = tostring(framework or 'auto'):lower()

    if framework == 'esx' then
        return 'ESX'
    elseif framework == 'qbcore' or framework == 'qb-core' or framework == 'qb' then
        return 'QBCore'
    elseif framework == 'qbox' or framework == 'qbx' or framework == 'qbx_core' then
        return 'Qbox'
    end

    return 'auto'
end

local function detectFramework()
    local configured = normalizeFrameworkName(HudMileage and HudMileage.framework or 'auto')
    if configured ~= 'auto' then
        return configured
    end

    if GetResourceState('qbx_core') == 'started' then
        return 'Qbox'
    end

    if GetResourceState('qb-core') == 'started' then
        return 'QBCore'
    end

    if GetResourceState('es_extended') == 'started' then
        return 'ESX'
    end

    return 'standalone'
end

local function setupFramework()
    Framework = detectFramework()

    if Framework == 'ESX' then
        local ok, object = pcall(function()
            return exports['es_extended']:getSharedObject()
        end)

        if ok then
            ESX = object
        end
    elseif Framework == 'QBCore' or Framework == 'Qbox' then
        local ok, object = pcall(function()
            return exports['qb-core']:GetCoreObject()
        end)

        if ok then
            QBCore = object
        end
    end
end

local function getMileageConfig()
    return HudMileage or {}
end

local function getMileageUnitLabel()
    local config = getMileageConfig()
    return config.unit == 'miles' and 'miles' or 'kilometers'
end

local function isMileageVehicleAllowed(vehicle)
    if vehicle == 0 then return false end

    local class = GetVehicleClass(vehicle)
    local excludedClasses = getMileageConfig().excludedClasses or {}

    return not excludedClasses[class]
end

local function getVehiclePlate(vehicle)
    if not vehicle or vehicle == 0 or not DoesEntityExist(vehicle) then return nil end

    local plate = GetVehicleNumberPlateText(vehicle)
    if not plate then return nil end

    return (plate:gsub('^%s*(.-)%s*$', '%1'))
end

local function getDisplayedMileage(mileageKm)
    local mileage = tonumber(mileageKm) or 0.0

    if getMileageUnitLabel() == 'miles' then
        mileage = mileage * 0.621371
    end

    return tonumber(string.format('%.1f', mileage))
end

local function resetMileageTracking()
    mileageState.lastVehicle = 0
    mileageState.lastPlate = nil
    mileageState.lastCoords = nil
    mileageState.currentMileage = 0.0
    mileageState.fetchedExistingMileage = false
    mileageState.lastSavedMileage = nil
    vehicleStatus.mileage = 0.0
    vehicleStatus.mileageUnit = getMileageUnitLabel()
end

local function saveMileageToServer(force)
    if not mileageState.lastPlate or mileageState.currentMileage <= 0 then return end

    local roundedMileage = tonumber(string.format('%.1f', mileageState.currentMileage))
    local threshold = (getMileageConfig().saveThreshold or 3.0)

    if force or mileageState.lastSavedMileage == nil or math.abs(roundedMileage - mileageState.lastSavedMileage) >= threshold then
        TriggerServerEvent('bg_hud:server:updateVehicleMileage', mileageState.lastPlate, roundedMileage)
        mileageState.lastSavedMileage = roundedMileage
    end
end

local function ensureMileageLoaded(vehicle)
    if mileageState.fetchedExistingMileage then return true end

    local plate = getVehiclePlate(vehicle)
    if not plate then return false end

    local mileage = Entity(vehicle).state.vehicleMileage
    if mileage == nil then
        mileage = lib.callback.await('bg_hud:server:getVehicleMileage', false, plate)
    end

    mileageState.lastVehicle = vehicle
    mileageState.lastPlate = plate
    mileageState.lastCoords = GetEntityCoords(vehicle)
    mileageState.currentMileage = tonumber(mileage) or 0.0
    mileageState.fetchedExistingMileage = true
    mileageState.lastSavedMileage = tonumber(mileage) or 0.0

    local roundedMileage = tonumber(string.format('%.1f', mileageState.currentMileage))
    Entity(vehicle).state:set('vehicleMileage', roundedMileage, true)
    vehicleStatus.mileage = getDisplayedMileage(roundedMileage)
    vehicleStatus.mileageUnit = getMileageUnitLabel()

    return true
end

local function updateVehicleMileage(vehicle)
    vehicleStatus.mileageUnit = getMileageUnitLabel()

    if vehicle == 0 or not DoesEntityExist(vehicle) or not isMileageVehicleAllowed(vehicle) then
        if mileageState.lastVehicle ~= 0 and mileageState.lastVehicle ~= vehicle then
            saveMileageToServer(true)
            resetMileageTracking()
        end

        vehicleStatus.mileage = 0.0
        return
    end

    local plate = getVehiclePlate(vehicle)
    if not plate then
        if mileageState.lastVehicle ~= 0 then
            saveMileageToServer(true)
            resetMileageTracking()
        end

        vehicleStatus.mileage = 0.0
        return
    end

    if mileageState.lastVehicle ~= 0 and mileageState.lastVehicle ~= vehicle then
        saveMileageToServer(true)
        resetMileageTracking()
    end

    if not ensureMileageLoaded(vehicle) then
        vehicleStatus.mileage = 0.0
        return
    end

    local driverPed = GetPedInVehicleSeat(vehicle, -1)
    if driverPed == PlayerPedId() and mileageState.lastCoords then
        local distance = 0.0
        if IsVehicleOnAllWheels(vehicle) and not IsEntityInWater(vehicle) then
            distance = #(GetEntityCoords(vehicle) - mileageState.lastCoords)
        end

        mileageState.currentMileage = mileageState.currentMileage + (distance / 1000.0)
        mileageState.lastCoords = GetEntityCoords(vehicle)

        local roundedMileage = tonumber(string.format('%.1f', mileageState.currentMileage))
        vehicleStatus.mileage = getDisplayedMileage(roundedMileage)
        Entity(vehicle).state:set('vehicleMileage', roundedMileage, true)
        saveMileageToServer(false)
    else
        mileageState.lastCoords = GetEntityCoords(vehicle)
        local syncedMileage = tonumber(Entity(vehicle).state.vehicleMileage) or tonumber(string.format('%.1f', mileageState.currentMileage))
        vehicleStatus.mileage = getDisplayedMileage(syncedMileage)
    end
end

local function isSeatbeltAllowed(vehicle)
    if vehicle == 0 then return false end

    local class = GetVehicleClass(vehicle)

    return class ~= 8   -- motorcycles
        and class ~= 13 -- cycles
        and class ~= 14 -- boats
        and class ~= 15 -- helicopters
        and class ~= 16 -- planes
end

-- This one is kept IDENTICAL in purpose to the source ejection script
local function isEjectVehicleClassAllowed(vehicle)
    local class = GetVehicleClass(vehicle)
    local disallowedClasses = {
        [8] = true,  -- Motorcycles
        [13] = true, -- Cycles
        [14] = true  -- Boats
    }

    return not disallowedClasses[class]
end

local function setSeatbeltState(state)
    seatbeltOn = state == true
    vehicleStatus.seatbeltOn = seatbeltOn

    if LocalPlayer and LocalPlayer.state then
        LocalPlayer.state:set('seatbelt', seatbeltOn, true)
    end

    if seatbeltOn then
        SetFlyThroughWindscreenParams(10000.0, 10000.0, defaultUnknownModifier, 500.0)
    else
        SetFlyThroughWindscreenParams(defaultEjectVelocity, defaultUnknownEjectVelocity, defaultUnknownModifier, defaultMinDamage)
    end
end

local function resetEjectState()
    lastFrameVehiclespeed2 = 0.0
    lastFrameVehiclespeed = 0.0
    newvehicleBodyHealth = 0.0
    currentvehicleBodyHealth = 0.0
    frameBodyChange = 0.0
    thisFrameVehicleSpeed = 0.0
    tick = 0
    veloc = vector3(0.0, 0.0, 0.0)
end

local function ejectFromVehicle()
    if seatbeltOn then return end

    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped, false)

    if veh == 0 then return end
    if IsVehicleStopped(veh) then return end

    local coords = GetOffsetFromEntityInWorldCoords(veh, 1.0, 0.0, 1.0)
    SetEntityCoords(ped, coords.x, coords.y, coords.z)
    Wait(1)
    SetPedToRagdoll(ped, 5511, 5511, 0, 0, 0, 0)
    SetEntityVelocity(ped, veloc.x * 4, veloc.y * 4, veloc.z * 4)
end

local function startSeatbeltEjectThread()
    if seatbeltEjectThreadRunning then return end
    seatbeltEjectThreadRunning = true

    CreateThread(function()
        local function resetVehicle()
            resetEjectState()
            Wait(1000)
        end

        while true do
            Wait(5)

            local ped = PlayerPedId()
            local currentVehicle = GetVehiclePedIsIn(ped, false)

            if currentVehicle ~= 0 then
                if not isEjectVehicleClassAllowed(currentVehicle) then
                    resetVehicle()
                    break
                end

                local multip = vehicleStatus.kmh and 3.6 or 2.236936

                thisFrameVehicleSpeed = GetEntitySpeed(currentVehicle) * multip
                currentvehicleBodyHealth = GetVehicleBodyHealth(currentVehicle)

                if currentvehicleBodyHealth == 1000 and frameBodyChange ~= 0 then
                    frameBodyChange = 0
                end

                if not seatbeltOn and frameBodyChange > 18.0 and thisFrameVehicleSpeed < (lastFrameVehiclespeed * 0.75) then
                    if lastFrameVehiclespeed > 45.0 then
                        if math.random(math.ceil(lastFrameVehiclespeed)) > lastFrameVehiclespeed * 0.5 then
                            ejectFromVehicle()
                        end
                    end
                end

                if lastFrameVehiclespeed < 45.0 then
                    Wait(100)
                    tick = 0
                end

                frameBodyChange = newvehicleBodyHealth - currentvehicleBodyHealth

                if tick > 0 then
                    tick = tick - 1
                    if tick == 1 then
                        lastFrameVehiclespeed = GetEntitySpeed(currentVehicle) * multip
                    end
                else
                    lastFrameVehiclespeed2 = GetEntitySpeed(currentVehicle) * multip
                    if lastFrameVehiclespeed2 > lastFrameVehiclespeed then
                        lastFrameVehiclespeed = GetEntitySpeed(currentVehicle) * multip
                    end
                    if lastFrameVehiclespeed2 < lastFrameVehiclespeed then
                        tick = 25
                    end
                end

                if tick < 0 then
                    tick = 0
                end

                newvehicleBodyHealth = GetVehicleBodyHealth(currentVehicle)
                veloc = GetEntityVelocity(currentVehicle)
            else
                resetVehicle()
                break
            end
        end

        seatbeltEjectThreadRunning = false
    end)
end

local function getCompassHeading()
    local camRotZ = GetGameplayCamRot(0).z
    return math.floor(360.0 - ((camRotZ + 360.0) % 360.0))
end

local function getStreetNames(ped)
    local coords = GetEntityCoords(ped)
    local streetHash, crossingRoadHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)

    local street1 = GetStreetNameFromHashKey(streetHash) or ''
    local street2 = GetStreetNameFromHashKey(crossingRoadHash) or ''

    return street1, street2
end

local function getQBPlayerData()
    if not QBCore or not QBCore.Functions or not QBCore.Functions.GetPlayerData then
        return nil
    end

    local ok, playerData = pcall(function()
        return QBCore.Functions.GetPlayerData()
    end)

    if ok then
        return playerData
    end

    return nil
end

local function isPlayerLoaded()
    if Framework == 'ESX' then
        if ESX and type(ESX.IsPlayerLoaded) == 'function' then
            local ok, loaded = pcall(ESX.IsPlayerLoaded)
            if ok then
                return loaded == true
            end
        end

        return ESX and ESX.PlayerLoaded == true
    elseif Framework == 'QBCore' or Framework == 'Qbox' then
        if LocalPlayer and LocalPlayer.state and LocalPlayer.state.isLoggedIn ~= nil then
            return LocalPlayer.state.isLoggedIn == true
        end

        local playerData = getQBPlayerData()
        return playerData ~= nil and next(playerData) ~= nil and playerData.citizenid ~= nil
    end

    return true
end

local function refreshNeedsFromESXStatus()
    local found = false

    TriggerEvent('esx_status:getStatus', 'hunger', function(status)
        found = true
        if status then
            playerStatus.hunger = (status.val or 0) / 10000
        end
    end)

    TriggerEvent('esx_status:getStatus', 'thirst', function(status)
        found = true
        if status then
            playerStatus.thirst = (status.val or 0) / 10000
        end
    end)

    TriggerEvent('esx_status:getStatus', 'stress', function(status)
        if status then
            playerStatus.stress = (status.val or 0) / 10000
        end
    end)

    return found
end

local function refreshNeedsFromQBMeta()
    local playerData = getQBPlayerData()
    local metadata = playerData and playerData.metadata or {}
    local state = LocalPlayer and LocalPlayer.state or {}

    local hunger = metadata.hunger
    local thirst = metadata.thirst
    local stress = metadata.stress

    if hunger == nil and state.hunger ~= nil then hunger = state.hunger end
    if thirst == nil and state.thirst ~= nil then thirst = state.thirst end
    if stress == nil and state.stress ~= nil then stress = state.stress end

    if hunger ~= nil then playerStatus.hunger = hunger end
    if thirst ~= nil then playerStatus.thirst = thirst end
    if stress ~= nil then playerStatus.stress = stress end
end

local function refreshFrameworkNeeds()
    if not isPlayerLoaded() then return end

    if Framework == 'ESX' then
        local updated = refreshNeedsFromESXStatus()

        if not updated then
            local state = LocalPlayer and LocalPlayer.state or {}
            if state.hunger ~= nil then playerStatus.hunger = state.hunger end
            if state.thirst ~= nil then playerStatus.thirst = state.thirst end
            if state.stress ~= nil then playerStatus.stress = state.stress end
        end
    elseif Framework == 'QBCore' or Framework == 'Qbox' then
        refreshNeedsFromQBMeta()
    else
        local state = LocalPlayer and LocalPlayer.state or {}
        if state.hunger ~= nil then playerStatus.hunger = state.hunger end
        if state.thirst ~= nil then playerStatus.thirst = state.thirst end
        if state.stress ~= nil then playerStatus.stress = state.stress end
    end

    playerStatus.hunger = math.max(0, math.min(100, tonumber(playerStatus.hunger) or 100))
    playerStatus.thirst = math.max(0, math.min(100, tonumber(playerStatus.thirst) or 100))
    playerStatus.stress = math.max(0, math.min(100, tonumber(playerStatus.stress) or 0))
end

SetPedConfigFlag(PlayerPedId(), 32, true)
SetFlyThroughWindscreenParams(defaultEjectVelocity, defaultUnknownEjectVelocity, defaultUnknownModifier, defaultMinDamage)
setupFramework()

local function getVehicleData()
    local ped = PlayerPedId()

    if not IsPedInAnyVehicle(ped, false) then
        vehicleStatus.inVehicle = false
        vehicleStatus.speed = 0
        vehicleStatus.rpm = 0
        vehicleStatus.fuel = 0
        vehicleStatus.gear = 0
        vehicleStatus.engineHealth = 1000
        vehicleStatus.bodyHealth = 1000
        vehicleStatus.lightsOn = false
        vehicleStatus.vehicleClass = 0
        vehicleStatus.heading = 0
        vehicleStatus.street1 = ''
        vehicleStatus.street2 = ''
        vehicleStatus.mileage = 0.0
        vehicleStatus.mileageUnit = getMileageUnitLabel()

        saveMileageToServer(true)
        resetMileageTracking()
        resetEjectState()

        if seatbeltOn then
            setSeatbeltState(false)
        end

        return
    end

    local veh = GetVehiclePedIsIn(ped, false)
    if veh == 0 then
        vehicleStatus.inVehicle = false
        vehicleStatus.mileage = 0.0
        resetEjectState()
        return
    end

    local _, lightsOn, highbeamsOn = GetVehicleLightsState(veh)
    local street1, street2 = getStreetNames(ped)

    vehicleStatus.inVehicle = true
    vehicleStatus.speed = math.floor(GetEntitySpeed(veh) * 3.6 + 0.5)
    vehicleStatus.rpm = GetVehicleCurrentRpm(veh)
    vehicleStatus.fuel = GetVehicleFuelLevel(veh)

    local currentGear = GetVehicleCurrentGear(veh)
    local relativeSpeed = GetEntitySpeedVector(veh, true)

    -- FiveM/GTA may report reverse as gear 0 on some vehicles/builds.
    -- When the vehicle is actually moving backwards, expose it as -1 so the NUI shows 'R'.
    if currentGear == 0 and vehicleStatus.speed > 0 and relativeSpeed.y < -0.1 then
        vehicleStatus.gear = -1
    else
        vehicleStatus.gear = currentGear
    end

    vehicleStatus.engineHealth = GetVehicleEngineHealth(veh)
    vehicleStatus.bodyHealth = GetVehicleBodyHealth(veh)
    vehicleStatus.lightsOn = lightsOn == 1 or highbeamsOn == 1
    vehicleStatus.kmh = true
    vehicleStatus.vehicleClass = GetVehicleClass(veh)
    vehicleStatus.heading = getCompassHeading()
    vehicleStatus.street1 = street1
    vehicleStatus.street2 = street2
    updateVehicleMileage(veh)
    startSeatbeltEjectThread()

    if not isSeatbeltAllowed(veh) then
        if seatbeltOn then
            setSeatbeltState(false)
        end
        vehicleStatus.seatbeltOn = false
    else
        vehicleStatus.seatbeltOn = seatbeltOn
    end
end

local function clamp(value, min, max)
    if value < min then return min end
    if value > max then return max end
    return value
end

local function round(num)
    return math.floor(num + 0.5)
end

local function getSettings()
    return HudSettings.Get()
end

local function getHealthPercent(ped)
    local currentHealth = GetEntityHealth(ped)
    return clamp(round(currentHealth - 100), 0, 100)
end

local function getArmorPercent(ped)
    return clamp(round(GetPedArmour(ped)), 0, 100)
end

local function getStaminaPercent(playerId)
    local nativeValue = GetPlayerSprintStaminaRemaining(playerId)
    return clamp(round(100 - nativeValue), 0, 100)
end

local function getOxygenPercent()
    if IsPedSwimmingUnderWater(PlayerPedId()) then
        local underwaterTime = GetPlayerUnderwaterTimeRemaining(PlayerId())
        local oxygen = (underwaterTime / 10.0) * 100.0
        return clamp(round(oxygen), 0, 100)
    end

    return 100
end

local function getMicState()
    return NetworkIsPlayerTalking(PlayerId()) or MumbleIsPlayerTalking(PlayerId())
end

local function getVoiceMode()
    local proximity = LocalPlayer.state.proximity

    if type(proximity) == 'table' then
        if proximity.index then
            return proximity.index
        end

        if proximity.mode then
            return proximity.mode
        end
    end

    if LocalPlayer.state['voiceMode'] then
        return LocalPlayer.state['voiceMode']
    end

    return 2
end

local function shouldShowMinimap(settings)
    if settings.cinematicMode then
        return false
    end

    local inVehicle = vehicleStatus.inVehicle
    local minimapMode = settings.minimapMode or 'always'

    if minimapMode == 'always' then
        return true
    elseif minimapMode == 'on_foot' then
        return not inVehicle
    elseif minimapMode == 'in_vehicle' then
        return inVehicle
    elseif minimapMode == 'disabled' then
        return false
    end

    return true
end

local function updateMinimap()
    local settings = getSettings()
    DisplayRadar(shouldShowMinimap(settings))
end

local function sendHud()
    local settings = getSettings()
    playerStatus.mic = getMicState()

    SendNUIMessage({
        action = 'updateHud',
        data = {
            visible = settings.hudVisible and not settings.cinematicMode and not pauseMenuHidden,
            serverId = GetPlayerServerId(PlayerId()),
            health = playerStatus.health,
            armor = playerStatus.armor,
            stamina = playerStatus.stamina,
            oxygen = playerStatus.oxygen,
            hunger = playerStatus.hunger,
            thirst = playerStatus.thirst,
            stress = playerStatus.stress,
            mic = playerStatus.mic,
            voiceMode = playerStatus.voiceMode,
            settings = settings,
            config = HudConfig or {},
            vehicle = vehicleStatus
        }
    })
end

RegisterNetEvent('hex_hud:refreshSettings', function()
    updateMinimap()
    sendHud()
end)

CreateThread(function()
    while true do
        local ped = PlayerPedId()
        local playerId = PlayerId()

        if DoesEntityExist(ped) then
            playerStatus.health = getHealthPercent(ped)
            playerStatus.armor = getArmorPercent(ped)
            playerStatus.stamina = getStaminaPercent(playerId)
            playerStatus.oxygen = getOxygenPercent()
            playerStatus.mic = getMicState()
            playerStatus.voiceMode = getVoiceMode()
        end

        getVehicleData()
        updateMinimap()
        sendHud()
        Wait(350)
    end
end)

CreateThread(function()
    while true do
        SetRadarBigmapEnabled(false, false)
        --SetRadarZoom(1100)
        Wait(1000)
    end
end)

local function UpdateRadarZoom()
    SetRadarZoom(1100)
    SetTimeout(10000, UpdateRadarZoom)
end

UpdateRadarZoom()

CreateThread(function()
    while true do
        refreshFrameworkNeeds()
        Wait(1500)
    end
end)

function calculateMinimapSizeAndPosition()
    SetBigmapActive(false, false)
    local minimap = {}
    local resX, resY = GetActiveScreenResolution()

    local aspectRatio = GetAspectRatio(false)
    local minimapRawX, minimapRawY

    SetScriptGfxAlign(string.byte("L"), string.byte("B"))

    if IsBigmapActive() then
        minimapRawX, minimapRawY = GetScriptGfxPosition(-0.00, 0.022 + -0.435416666)
        minimap.width = resX / (2.52 * aspectRatio)
        minimap.height = resY / 2.4374
        goto continue
    end

    minimapRawX, minimapRawY = GetScriptGfxPosition(0.000, 0.002 + -0.229888)
    minimap.width = resX / (3.48 * aspectRatio)
    minimap.height = resY / 5.55

    ::continue::

    ResetScriptGfxAlign()

    minimap.leftX = minimapRawX
    minimap.rightX = minimapRawX + minimap.width
    minimap.topY = minimapRawY
    minimap.bottomY = minimapRawY + minimap.height
    minimap.X = minimapRawX + (minimap.width / 2)
    minimap.Y = minimapRawY + (minimap.height / 2)

    minimap.webLeft = minimapRawX * resX
    minimap.webTop = minimapRawY * resY
    minimap.webWidth = (minimap.width / resX) * resX
    minimap.webHeight = (minimap.height / resY) * resY

    return {
        top = minimap.webTop,
        left = minimap.webLeft,
        height = minimap.webHeight,
        width = minimap.webWidth,
    }
end

function preventBigmapFromStayingActive()
    local timeout = 0
    while true do
        SetBigmapActive(false, false)

        if timeout >= 10000 then
            return
        end

        timeout = timeout + 1000
        Wait(1000)
    end
end

function setupMinimap()
    local defaultAspectRatio = 1920 / 1080
    local resolutionX, resolutionY = GetActiveScreenResolution()
    local aspectRatio = resolutionX / resolutionY
    local minimapOffset = 0

    if aspectRatio > defaultAspectRatio then
        minimapOffset = ((defaultAspectRatio - aspectRatio) / 3.6) - 0.008
    end

    RequestStreamedTextureDict("squaremap", false)

    while not HasStreamedTextureDictLoaded("squaremap") do
        Wait(100)
    end

    SetMinimapClipType(0)
    AddReplaceTexture("platform:/textures/graphics", "radarmasksm", "squaremap", "radarmasksm")
    AddReplaceTexture("platform:/textures/graphics", "radarmask1g", "squaremap", "radarmasksm")

    SetMinimapComponentPosition("minimap", "L", "B", 0.0 + minimapOffset, -0.047, 0.1638, 0.183)
    SetMinimapComponentPosition("minimap_mask", "L", "B", 0.0 + minimapOffset, 0.0, 0.128, 0.20)
    SetMinimapComponentPosition("minimap_blur", "L", "B", -0.01 + minimapOffset, 0.025, 0.262, 0.300)

    SetBlipAlpha(GetNorthRadarBlip(), 0)
    SetBigmapActive(true, false)
    SetMinimapClipType(0)
    CreateThread(preventBigmapFromStayingActive)
end

CreateThread(function()
    SetMapZoomDataLevel(0, 2.75, 0.9, 0.08, 0.0, 0.0) -- Level 0
    SetMapZoomDataLevel(1, 2.8, 0.9, 0.08, 0.0, 0.0) -- Level 1
    SetMapZoomDataLevel(2, 8.0, 0.9, 0.08, 0.0, 0.0) -- Level 2
    SetMapZoomDataLevel(3, 20.0, 0.9, 0.08, 0.0, 0.0) -- Level 3
    SetMapZoomDataLevel(4, 35.0, 0.9, 0.08, 0.0, 0.0) -- Level 4
    SetMapZoomDataLevel(5, 55.0, 0.0, 0.1, 2.0, 1.0) -- ZOOM_LEVEL_GOLF_COURSE
    SetMapZoomDataLevel(6, 450.0, 0.0, 0.1, 1.0, 1.0) -- ZOOM_LEVEL_INTERIOR
    SetMapZoomDataLevel(7, 4.5, 0.0, 0.0, 0.0, 0.0) -- ZOOM_LEVEL_GALLERY
    SetMapZoomDataLevel(8, 11.0, 0.0, 0.0, 2.0, 3.0) -- ZOOM_LEVEL_GALLERY_MAXIMIZE
    SetRadarZoom(1200) -- Radar zoom one time on resource start
end)

CreateThread(function()
    while true do
        SetRadarAsExteriorThisFrame()
        local coords = vec(4700.0, -5145.0)
        SetRadarAsInteriorThisFrame(`h4_fake_islandx`, coords.x, coords.y, 0, 0)
        Wait(0)
    end
end)

if not IsDuplicityVersion() then
    calculateMinimapSizeAndPosition()
    CreateThread(setupMinimap)
end

CreateThread(function()
    local lastPauseState = false

    while true do
        local isPaused = IsPauseMenuActive()

        if isPaused ~= lastPauseState then
            lastPauseState = isPaused
            pauseMenuHidden = isPaused
            sendHud()
        end

        Wait(250)
    end
end)

local function initializeHud()
    HudSettings.Load()
    refreshFrameworkNeeds()
    Wait(500)
    updateMinimap()
    sendHud()
end

CreateThread(function()
    while not isPlayerLoaded() do
        Wait(1000)
    end

    initializeHud()
end)

RegisterNetEvent('esx:playerLoaded', function()
    if Framework == 'ESX' then
        initializeHud()
    end
end)

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    if Framework == 'QBCore' or Framework == 'Qbox' then
        initializeHud()
    end
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    if Framework == 'QBCore' or Framework == 'Qbox' then
        resetMileageTracking()
        resetEjectState()
        setSeatbeltState(false)
    end
end)

RegisterNetEvent('qbx_core:client:playerLoggedOut', function()
    if Framework == 'Qbox' then
        resetMileageTracking()
        resetEjectState()
        setSeatbeltState(false)
    end
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function()
    if Framework == 'QBCore' or Framework == 'Qbox' then
        refreshFrameworkNeeds()
        sendHud()
    end
end)

RegisterNetEvent('qbx_core:client:onSetMetaData', function(key, _, newValue)
    if Framework ~= 'Qbox' then return end

    if key == 'hunger' then
        playerStatus.hunger = tonumber(newValue) or playerStatus.hunger
    elseif key == 'thirst' then
        playerStatus.thirst = tonumber(newValue) or playerStatus.thirst
    elseif key == 'stress' then
        playerStatus.stress = tonumber(newValue) or playerStatus.stress
    else
        return
    end

    sendHud()
end)

RegisterCommand('seatbelt', function()
    if IsPauseMenuActive() then return end

    local ped = PlayerPedId()

    if not IsPedInAnyVehicle(ped, false) then return end

    local veh = GetVehiclePedIsIn(ped, false)
    if veh == 0 then return end
    if not isSeatbeltAllowed(veh) then return end

    setSeatbeltState(not seatbeltOn)
    sendHud()
end, false)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    saveMileageToServer(true)
end)

RegisterKeyMapping('seatbelt', 'Toggle seatbelt', 'keyboard', 'B')

CreateThread(function()
    while true do
        if seatbeltOn and vehicleStatus.inVehicle then
            DisableControlAction(0, 75, true)
            Wait(0)
        else
            Wait(200)
        end
    end
end)

exports('isSeatbeltOn', function()
    return seatbeltOn
end)

exports('toggleSeatbelt', function(state)
    if state == nil then
        setSeatbeltState(not seatbeltOn)
    else
        setSeatbeltState(state == true)
    end

    sendHud()
end)
