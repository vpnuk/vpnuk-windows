# Contributing

## Tech stack

- Electron
  - Node
  - yarn
- React
- MobX 6

## Dev environment setup

1. Install dependencies: `yarn install`
1. Run app `yarn run start`

## Local build

1. Run `yarn run build`
1. Get installer and .7z packages from `./release/nsis-web` folder

## Release

1. Push/merge to master new commit with `package.json` `version` field updated
1. Wait the [github actions builder](https://github.com/vpnuk/vpnuk-windows/actions) to finish
1. Open [releases list](https://github.com/vpnuk/vpnuk-windows/releases) and arrange release from the draft created on previous step
1. `VPNUK-Web-Setup-x.x.x.exe` and both *.7z packages at yours disposal

## Project structure

- app
  - assets _- common assets such as pictures and icons_
  - main _- nodejs backed part, electron main process_
    - main.js _- electron enrty point_
  - modules _- modules which are common for main and renderer parts_
  - renderer _- reactjs frontend part, electron renderer process_
    - components _- react components_
    - domain _- observable application domain_
      - catalog _- application dynamic catalogs_
      - entity _- domain entities_
      - store _- domain stores_
- build _- react-build build output dir_
- node\_modules _- the black hole on your disk_
- nsis _- installer extensions subdir_
  - Plugins _- nsis plugins, dir contents must be copied to ../build dir before electron-builder starts_
- public _- electron web templates_
- release _- build output dir_
- dev-app-update.yml _- config for electron auto-update testing_
- package.json _- project settings and scripts_
- yarn.lock _- dependencies lock file, must be commited on each change_

## Git flow

Classic merge-flow is used.
Release branch is `master`.
Develop branch is `dev`.
Releases are marked with tags via github actions builder.
