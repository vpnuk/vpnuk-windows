!include MUI2.nsh
!macro customWelcomePage
	!insertMacro MUI_PAGE_WELCOME
!macroEnd

; ---------------------------------- COMMON -----------------------------------
!include nsDialogs.nsh
!include WordFunc.nsh
!include x64.nsh

!macro ClearStack
    ${Do}
        Pop $0
        IfErrors send
    ${Loop}
send:
!macroend
!define ClearStack "!insertmacro ClearStack"

!macro uninstallOvpn
    ; old versions
    ReadRegStr $0 HKLM SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\OpenVPN UninstallString
    ${If} $0 != ""
        nsExec::ExecToStack "$0 /S"  uninstall
        Pop $0
        Pop $0 ; Ruin inetc::get call if no pops made here
        MessageBox MB_OK "Deleting OpenVPN"
        Sleep 5000 ; Exec doesn't wait old uninstaller for some reason.
                   ; May conflict with installer later.
    ${EndIf}
    ; new versions (2.5.x+)
    nsExec::ExecToStack `wmic product where "name like 'OpenVPN _._.%'" get LocalPackage /format:list` 
    Pop $0
    Pop $0 ; LocalPackage=C:\Windows\Installer\1fb7bb.msi // No Instance(s) Available
    ${WordFind} $0 "LocalPackage=" "E-1" $0
    ${WordFind} $0 ".msi" "E+1{*" $0
    StrLen $1 $0
    ${If} $1 > 1
        nsExec::ExecToStack "MsiExec.exe /x $0 /passive"
    ${EndIf}
!macroend
!define uninstallOvpn "!insertmacro uninstallOvpn"

!macro radioBtnClick
    Pop $hwnd
    nsDialogs::GetUserData $hwnd
    pop $radioValue
!macroend
!define radioBtnClick "!insertmacro radioBtnClick"

; ---------------------------------- INSTALL ----------------------------------
!macro customPageAfterChangeDir

; --------------- OVPN ----------------
    !pragma warning disable 6040 ; Disable 'LangString is not set in language table of language <lang>'
    LangString title 1033 "OpenVPN"
    LangString subtitle 1033 "OpenVPN installation"
    Page custom ovpnPageCreate ovpnPageLeave

    Var ovpnVersion
    Var ovpnInstallerUrl
    Var ovpnDialog
    Var ovpnPath
    Var installedOvpnVer
    Var hwnd
    Var radioValue
    Var height
    Function ovpnPageCreate
        Call getFromVerionsJson
        StrCpy $height 22
        !insertmacro MUI_HEADER_TEXT $(title) $(subtitle)
        nsDialogs::Create 1018
        Pop $ovpnDialog
        ${If} $ovpnDialog == error
            Abort
        ${EndIf} 

        ReadRegStr $ovpnPath HKLM SOFTWARE\OpenVPN exe_path
        ${If} $ovpnPath != ""
            Call getOvpnVersion ; => $installedOvpnVer
        ${EndIf}
        
        ${NSD_CreateLabel} 0 0 100% 12u "Select OpenVPN to use:"
        Pop $hwnd
        
        StrCmp $ovpnPath "" +2 0
        StrCmp $ovpnVersion $installedOvpnVer install_option_end 0
        ${NSD_CreateRadioButton} 12 $height 100% 20 "Install OpenVPN $ovpnVersion"
        pop $hwnd
        nsDialogs::SetUserData $hwnd "true"
        ${NSD_OnClick} $hwnd radioBtnClick
        IntOp $height $height + 20
        StrCpy $radioValue "true"
    install_option_end:

        StrCmp $ovpnPath "" use_option_end 0
        ${NSD_CreateRadioButton} 12 $height 100% 20 "Use installed OpenVPN $installedOvpnVer"
        pop $hwnd
        nsDialogs::SetUserData $hwnd "false"
        ${NSD_OnClick} $hwnd radioBtnClick
        StrCpy $radioValue "false"
    use_option_end:

        ${NSD_Check} $hwnd

        nsDialogs::Show
    FunctionEnd

    Function radioBtnClick
        ${radioBtnClick}
    FunctionEnd

    Function getOvpnVersion
        nsExec::ExecToStack "$ovpnPath --version"
        Pop $0
        Pop $0
        ${If} $0 != ""
            ${WordFind2X} $0 "OpenVPN " " " "+1" $1
            StrCpy $installedOvpnVer $1
        ${Else}
            MessageBox MB_OK "Error getting openvpn version:$\n$0"
            StrCpy $installedOvpnVer ""
        ${EndIf}
    FunctionEnd

    Function getFromVerionsJson
        ${ClearStack}
        inetc::get /NOCANCEL /SILENT "https://www.serverlistvault.com/versions.json" "$TEMP\versions.json" /END
        Pop $0
        ${If} $0 == "OK"
            nsJSON::Set /file "$TEMP\versions.json"
            
            nsJSON::Get "openvpn" "version" /end
            Pop $ovpnVersion

            ${If} ${RunningX64}
                StrCpy $1 "win64"
            ${Else}
                StrCpy $1 "win32"
            ${EndIf}

            nsJSON::Get "openvpn" "original" $1 /end
            Pop $ovpnInstallerUrl
        ${Else}
            MessageBox MB_OK "Error loading versions.json:$\n$0"
        ${EndIf}
    FunctionEnd

    Function ovpnPageLeave
        ${If} $radioValue == ""
            MessageBox MB_OK "Please specify your choice"
            Abort
        ${ElseIf} $radioValue == true
            ${If} $ovpnPath != ""
                ${uninstallOvpn}
            ${EndIf}

            ${ClearStack}
            inetc::get $ovpnInstallerUrl "$TEMP\ovpnInstaller.msi" /nocancel
            Pop $1
            
            ${If} $1 == "OK"
                nsExec::ExecToStack 'cmd /c "$TEMP\ovpnInstaller.msi" \
                    ADDLOCAL=OpenVPN,OpenVPN.Service,Drivers,Drivers.TAPWindows6 \
                    SELECT_ASSOCIATIONS=0 /passive'
                Pop $0
                
                ${If} $0 != 0
                    Pop $0
                    MessageBox MB_OK "Error installing openvpn:$\n$0"
                    Abort
                ${EndIf}
            ${Else}
                MessageBox MB_OK "Error loading openvpn:$\n$1"
                Abort
            ${EndIf}
        ${EndIf}
    FunctionEnd
    !pragma warning enable 6040 ; Enable back
!macroend

; --------------------------------- UNINSTALL ---------------------------------
!macro customUninstallPage

; --------------- OVPN ----------------
    !pragma warning disable 6040
    LangString title 1033 "OpenVPN"
    LangString subtitle 1033 "OpenVPN uninstallation"
    UninstPage custom un.OvpnPageCreate un.OvpnPageLeave

    Var ovpnDialog
    Var hwnd
    Var radioValue

    Function un.OvpnPageCreate
        ReadRegStr $0 HKLM SOFTWARE\OpenVPN exe_path
        ${If} $0 == ""
            Abort
        ${EndIf}

        !insertmacro MUI_HEADER_TEXT $(title) $(subtitle)
        nsDialogs::Create 1018
        Pop $ovpnDialog
        ${If} $ovpnDialog == error
            Abort
        ${EndIf}

        ${NSD_CreateLabel} 0 0 100% 12u "Do you want to uninstall OpenVPN?"
        Pop $hwnd

        ${NSD_CreateRadioButton} 12 22 100% 20 "Yes"
        pop $hwnd
        nsDialogs::SetUserData $hwnd "true"
        ${NSD_OnClick} $hwnd un.radioBtnClick

        ${NSD_CreateRadioButton} 12 42 100% 20 "No"
        pop $hwnd
        nsDialogs::SetUserData $hwnd "false"
        ${NSD_OnClick} $hwnd un.radioBtnClick

        ${NSD_Check} $hwnd
        StrCpy $radioValue "false"

        nsDialogs::Show
    FunctionEnd

    Function un.radioBtnClick
        ${radioBtnClick}
    FunctionEnd

    Function un.OvpnPageLeave
        ${If} $radioValue == ""
            MessageBox MB_OK "Please specify your choice"
            Abort
        ${ElseIf} $radioValue == true
            ${uninstallOvpn}
        ${EndIf}
    FunctionEnd
    !pragma warning enable 6040
!macroend