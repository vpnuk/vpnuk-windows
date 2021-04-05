!include MUI2.nsh
!macro customWelcomePage
	!insertMacro MUI_PAGE_WELCOME
!macroEnd

!macro ClearStack
    ${Do}
        Pop $0
        IfErrors send
    ${Loop}
send:
!macroend
!define ClearStack "!insertmacro ClearStack"

!include nsDialogs.nsh
!include WordFunc.nsh
!include x64.nsh

!macro customPageAfterChangeDir
    !pragma warning disable 6040 ; Disable 'LangString is not set in language table of language <lang>'
    LangString title 1033 "OpenVPN"
    LangString subtitle 1033 "OpenVPN installation"
    Page custom ovpnPageCreate ovpnPageLeave

    Var ovpnVersion
    Var ovpnDialog
    Var ovpnPath
    Var installedOvpnVer
    Var hwnd
    Var radioValue
    Var height
    Function ovpnPageCreate
        StrCpy $ovpnVersion "2.5.1" ; TODO: get from build options
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
        Pop $hwnd
        nsDialogs::GetUserData $hwnd
        pop $radioValue
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

    Function ovpnPageLeave
        ${If} $radioValue == ""
            MessageBox MB_OK "Please specify your choice"
            Abort
        ${ElseIf} $radioValue == true
            ReadRegStr $0 HKLM SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\OpenVPN UninstallString
            ${If} $0 != ""
                nsExec::ExecToStack "$0 /S" ; old versions uninstall
                Sleep 5000 ; Exec doesn't wait old uninstaller for some reason.
                           ; May conflict with installer later.
            ${EndIf}

            ${If} ${RunningX64}
                StrCpy $1 "amd64"
            ${Else}
                StrCpy $1 "x86"
            ${EndIf}

            ${ClearStack}
            inetc::get "https://swupdate.openvpn.org/community/releases/OpenVPN-$ovpnVersion-I601-$1.msi" "$TEMP\ovpnInstaller.msi" /nocancel
            Pop $1
            
            ${If} $1 == "OK"
                nsExec::ExecToStack 'cmd /c "$TEMP\ovpnInstaller.msi" /passive'
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

