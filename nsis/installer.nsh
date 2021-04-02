!include MUI2.nsh

!macro customWelcomePage
	!insertMacro MUI_PAGE_WELCOME
!macroEnd

!include nsDialogs.nsh
!include WordFunc.nsh
!include x64.nsh

!macro customPageAfterChangeDir
    !pragma warning disable 6040 ; Disable 'LangString is not set in language table of language <lang>'
    LangString title 1033 "OpenVPN"
    LangString subtitle 1033 "OpenVPN installation"
    Page custom ovpnPageCreate ovpnPageLeave ovpnPage

    Var ovpnVersion
    Var ovpnDialog
    Var ovpnPath
    Var installedOvpnVer
    Var hwnd
    Var firstOption
    Var radioValue

    Function ovpnPageCreate
        StrCpy $ovpnVersion "2.5.1" ; TODO: get from build options
        !insertmacro MUI_HEADER_TEXT $(title) $(subtitle)
        nsDialogs::Create 1018
        Pop $ovpnDialog
        ${If} $ovpnDialog == error
            Abort
        ${EndIf} 

        ReadRegStr $ovpnPath HKLM SOFTWARE\OpenVPN exe_path

        ${NSD_CreateLabel} 0 0 100% 12u "Select OpenVPN to use:"
        Pop $hwnd

        ${NSD_CreateRadioButton} 12 22 100% 20 "Install OpenVPN $ovpnVersion"
        pop $firstOption
        nsDialogs::SetUserData $firstOption "true"
        ${NSD_OnClick} $firstOption radioBtnClick

        ${If} $ovpnPath != ""
            Call getOvpnVersion
            ${NSD_CreateRadioButton} 12 42 100% 20 "Use installed OpenVPN $installedOvpnVer"
            pop $hwnd
            nsDialogs::SetUserData $hwnd "false"
		    ${NSD_OnClick} $hwnd radioBtnClick
        ${EndIf}
        
        ${NSD_Check} $firstOption
        StrCpy $radioValue "true"

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
        ${If} $0 = 0
            Pop $0
            ${WordFind2X} $0 "OpenVPN " " " "+1" $1
            StrCpy $installedOvpnVer $1
        ${Else}
            StrCpy $installedOvpnVer ""
        ${EndIf}
    FunctionEnd

    Function ovpnPageLeave
        ${If} $radioValue == ""
            MessageBox MB_OK "Please specify your choice"
            Abort
        ${ElseIf} $radioValue == true
            ${If} ${RunningX64}
                StrCpy $0 "amd64"
            ${Else}
                StrCpy $0 "x86"
            ${EndIf} 

            inetc::get "https://swupdate.openvpn.org/community/releases/OpenVPN-$ovpnVersion-I601-$0.msi" "$TEMP\ovpnInstaller.msi" /nocancel
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

