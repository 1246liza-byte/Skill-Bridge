import { createContext, useContext, useState, useEffect } from 'react';
import * as siteApi from '../api/site';
import { toArray } from '../utils/format';

const SiteContext = createContext();

export function SiteProvider({ children }) {
    const [settings, setSettings] = useState(null);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSite = async () => {
            try {
                const [settingsRes, bannersRes] = await Promise.all([
                    siteApi.getSiteSettings(),
                    siteApi.getBanners(),
                ]);
                setSettings(settingsRes.data.settings || settingsRes.data);
                setBanners(toArray(bannersRes));
            } catch (err) {
                // Site settings may not exist yet; use defaults
                setSettings(null);
                setBanners([]);
            } finally {
                setLoading(false);
            }
        };
        loadSite();
    }, []);

    const refreshSettings = async () => {
        try {
            const { data } = await siteApi.getSiteSettings();
            setSettings(data.settings || data);
        } catch (err) {
            // ignore
        }
    };

    const refreshBanners = async () => {
        try {
            const res = await siteApi.getBanners();
            setBanners(toArray(res));
        } catch (err) {
            // ignore
        }
    };

    return (
        <SiteContext.Provider
            value={{ settings, banners, loading, refreshSettings, refreshBanners }}
        >
            {children}
        </SiteContext.Provider>
    );
}

export function useSite() {
    return useContext(SiteContext);
}