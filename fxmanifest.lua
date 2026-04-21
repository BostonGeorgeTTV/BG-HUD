fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'bg_hud'
author 'BostonGeorgeTTV'
description 'HUD status for FiveM'
version '1.1.0'

ui_page 'web/dist/index.html'

files {
    'install/*.sql',
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
    'web/dist/assets/*.png',
    'web/dist/assets/*.svg',
    'web/dist/assets/*.woff',
    'web/dist/assets/*.woff2',

    'web/dist/orhud.css',
    'web/dist/*.ico',
    'web/dist/images/**/*',
    'web/dist/fonts/**/*',
    'web/dist/*.gif',
    'web/dist/*.png',
    'web/dist/*.svg',
    'web/dist/*.webp',
    'web/dist/*.ogg',
}

shared_scripts {
    '@ox_lib/init.lua',
    'client/config.lua'
}

client_scripts {
    'client/settings.lua',
    'client/client.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/init_sql.lua',
    'server/mileage.lua'
}

dependencies {
    'ox_lib',
    'oxmysql'
}