HudConfig = {
    cinematicBars = {
        enabled = true,
        height = '10vh'
    },
    logo = {
        enabled = true,
        url = '',
        localPath = './logo.png',
        width = 180,
        top = '2.2rem',
        right = '2.2rem'
    }
}


HudMileage = {
    enabled = true,
    autoRunSQL = true,
    framework = 'auto', -- 'auto', 'ESX', 'QBCore', 'Qbox'
    unit = 'kilometers', -- 'kilometers' or 'miles'
    saveThreshold = 3.0,
    excludedClasses = {
        [13] = true,
        [14] = true,
        [15] = true,
        [16] = true,
        [17] = true,
        [21] = true
    }
}
