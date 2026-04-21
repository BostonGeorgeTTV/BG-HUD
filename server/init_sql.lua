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

if HudMileage and HudMileage.autoRunSQL then
    local ok = pcall(function()
        local framework = normalizeFrameworkName(HudMileage.framework)

        if framework == 'auto' then
            if GetResourceState('qbx_core') == 'started' then
                framework = 'Qbox'
            elseif GetResourceState('qb-core') == 'started' then
                framework = 'QBCore'
            else
                framework = 'ESX'
            end
        end

        local fileName = (framework == 'QBCore' or framework == 'Qbox') and 'run-qb.sql' or 'run-esx.sql'
        local file = assert(io.open(GetResourcePath(GetCurrentResourceName()) .. '/install/' .. fileName, 'rb'))
        local sql = file:read('*all')
        file:close()

        MySQL.query.await(sql)
    end)

    if not ok then
        print('^3[bg_hud] SQL auto setup non riuscito. Esegui manualmente il file SQL in install/.^0')
    end
end
