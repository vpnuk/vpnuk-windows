# Readme

## Development

1. Install dependencies: `yarn install`
1. Run app `yarn run start`

## Release

1. Build executable: `yarn run build` (it takes a while)
1. Run installer: `release/vpnuk_installer.exe`
   1. Application will be installed to `<YOUR_USER_DIR>/AppData/Local/Programs/vpnuk`
   1. Desktop and start menu shortcuts will be created
   1. Application will be started
   1. Application configuration file will be stored in `<YOUR_USER_DIR>/AppData/Roaming/VPNUK`
1. Start application manually if needed

## OpenVPN

### Get path from registry

```ps
# ovpn installation path
reg query HKLM\SOFTWARE\OpenVPN\ /ve
# ovpn exe path
reg query HKLM\SOFTWARE\OpenVPN\ /v exe_path
```

### Command options

```text
openvpn.exe
  --config <path-to-ovpn>
  --proto <p:udp, tcp-server, or tcp-client>
  --remote host [port] : Remote host name or ip address
  --auth-user-pass <path-to-profile.txt>
  
  --redirect-gateway <FLAG: def1>
  
  --dhcp-option type [parm] (allow multiple options)
  --dhcp-option DNS addr

  --mssfix [n]    : Set upper bound on TCP MSS, default = tun-mtu size or --fragment max value, whichever is lower.

  --tun-mtu n : Take the tun/tap device MTU to be n and derive the TCP/UDP MTU from it (default=1500).

  --log file      : Output log to file which is created/truncated on open.
  --log-append file : Append log to file, or create file if nonexistent.

  --version => version info
```
