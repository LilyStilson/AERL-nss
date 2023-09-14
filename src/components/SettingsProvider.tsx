// import React, { createContext, useContext, useEffect, useState } from "react";
// import { Settings } from "../classes/Settings";
// import { emit } from "@tauri-apps/api/event";

// // type SetStateAction<S> = S | ((prevState: S) => S)
// // type Dispatch<A> = (value: A) => void
// // Dispatch<SetStateAction<Settings>> === Dispatch<Settings | ((prevState: Settings) => Settings)> === (value: Settings | ((prevState: Settings) => Settings)) => void
// type TauriDispatch<A> = (value: A, emitEvent?: string) => void

// type TSettingsProviderContext = [settings: Settings, setSettings: TauriDispatch<React.SetStateAction<Settings>>]

// export let SettingsProviderContext = createContext<TSettingsProviderContext>({} as TSettingsProviderContext) 

// // export function useSettings() {
// //     return useContext(SettingsProviderContext)
// //}

// export function useSettings(initialState?: Settings) {
//     let [settings, setSettings] = useState(initialState ?? new Settings())

//     const setSettingsCallback = (action: React.SetStateAction<Settings>, emitEvent?: string) => {
//         setSettings(action)
//         if (emitEvent)
//             emit(emitEvent, { settings: settings.Current })
//         console.debug("SettingsProvider.tsx :: Settings state changed", settings.Current)
//     }

//     return [settings, setSettingsCallback] as [Settings, TauriDispatch<React.SetStateAction<Settings>>]
// }


// export function SettingsProvider({ children }: { children: React.ReactNode }) {
//     let [settingsState, setSettingsState] = useState(new Settings())

//     SettingsProviderContext = createContext<TSettingsProviderContext>([settingsState, setSettingsState])

//     const setSettingsCallback = (action: React.SetStateAction<Settings>, emitEvent?: string) => {
//         setSettingsState(action)
//         if (emitEvent)
//             emit(emitEvent, { settings: settingsState.Current })
//         console.debug("SettingsProvider.tsx :: Settings state changed", settingsState.Current)
//     }

//     return (
//         <SettingsProviderContext.Provider value={[settingsState, setSettingsCallback]}>
//             {children}
//         </SettingsProviderContext.Provider>
//     )
// }