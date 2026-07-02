# Upgrade Guide — TennoDex to Forge v1.0.0-rc.1

## Upgrading from the Prototype (TennoDex)

If you used the prototype "TennoDex" application, your data will be automatically migrated on first launch.

### Automatic migration

1. All `tennodex_*` localStorage keys → `frg_*` 
2. All `tdx_*` localStorage keys → `frg_*`
3. Old keys are removed after migration

### What migrates

| Data | Migrated |
|------|:--------:|
| Builds | ✅ |
| Projects | ✅ |
| Wishlists | ✅ |
| Plugins/Rivens | ✅ |
| Player timeline | ✅ |
| Window layout | ✅ |
| Onboarding state | ✅ |

### What does not migrate

- The IPC bridge was renamed from `window.tennoDex` to `window.forge`. External scripts using the old name will need updating.

## Fresh Install

Simply clone and build:

```
git clone https://github.com/forgebuild/forge.git
cd forge
npm ci
npm run build
npm start
```
