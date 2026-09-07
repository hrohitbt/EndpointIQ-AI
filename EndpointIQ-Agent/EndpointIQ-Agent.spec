# -*- mode: python ; coding: utf-8 -*-
#
# onedir build (not onefile): a Windows service frozen with PyInstaller's
# onefile mode has to self-extract to a temp dir on every launch. On a
# machine with real-time AV/EDR scanning that extraction, startup can
# blow past the SCM's ~30s service-start timeout -> Error 1053. onedir
# ships the extracted files directly, so there's nothing to unpack at
# service-start time.

a = Analysis(
    ['service.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=['win32timezone', 'win32serviceutil', 'servicemanager'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='EndpointIQ-Agent',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='EndpointIQ-Agent',
)
