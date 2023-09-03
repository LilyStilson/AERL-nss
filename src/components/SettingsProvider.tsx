import React, { createContext, useContext } from "react";
import { Settings, settings } from "../classes/Settings";

const SettingsProviderContext = createContext<Settings>(settings)

export function useSettings() {
    return useContext(SettingsProviderContext)
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const ctx = useContext(SettingsProviderContext)

    return (
        <SettingsProviderContext.Provider value={ctx}>
            {children}
        </SettingsProviderContext.Provider>
    )
}