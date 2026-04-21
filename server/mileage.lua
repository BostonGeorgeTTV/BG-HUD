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

local function resolveFrameworkVehiclesTable()
    local framework = normalizeFrameworkName(HudMileage and HudMileage.framework or 'auto')

    if framework == 'auto' then
        if GetResourceState('qbx_core') == 'started' then
            framework = 'Qbox'
        elseif GetResourceState('qb-core') == 'started' then
            framework = 'QBCore'
        elseif GetResourceState('es_extended') == 'started' then
            framework = 'ESX'
        else
            framework = 'ESX'
        end
    end

    if framework == 'QBCore' or framework == 'Qbox' then
        return 'player_vehicles'
    end

    return 'owned_vehicles'
end

local vehiclesTable = resolveFrameworkVehiclesTable()

local function getMileageInKmByPlate(plate)
    if not plate or plate == '' then return 0 end

    local mileageKm = MySQL.scalar.await('SELECT mileage FROM ' .. vehiclesTable .. ' WHERE plate = ?', { plate })
    return mileageKm or 0
end

lib.callback.register('bg_hud:server:getVehicleMileage', function(_, plate)
    return getMileageInKmByPlate(plate)
end)

RegisterNetEvent('bg_hud:server:updateVehicleMileage', function(plate, mileage)
    if not plate or plate == '' or type(mileage) ~= 'number' then return end
    MySQL.update('UPDATE ' .. vehiclesTable .. ' SET mileage = ? WHERE plate = ?', { mileage, plate })
end)

exports('getMileageByPlate', function(plate)
    return getMileageInKmByPlate(plate)
end)

exports('getVehicleMileageUnit', function()
    return (HudMileage and HudMileage.unit) or 'kilometers'
end)
