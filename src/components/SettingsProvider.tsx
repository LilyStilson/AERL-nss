import React, { createContext, useContext } from "react";
import { Settings } from "../classes/Settings";

const SettingsProviderContext = createContext<Settings>(new Settings())

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