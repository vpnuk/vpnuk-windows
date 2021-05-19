import React, { useEffect, useState } from 'react';
import { RootStore } from '@domain';

const StoreContext = React.createContext();

export const StoreProvider = ({ children, loading }) => {
    const store = new RootStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // delayAsyncCall(2500).then(() => setIsLoading(false)); // for debug purpose only
        
        setIsLoading(false);
    }, []);

    return isLoading
        ? loading
        : (
            <StoreContext.Provider value={store}>
                {children}
            </StoreContext.Provider>
        );
};

export const useStore = () => {
    const store = React.useContext(StoreContext);
    if (!store) {
        throw new Error('useStore must be used within a StoreProvider.');
    }
    return store;
};

// for debug purpose only
function delayAsyncCall(delaySec) {
    return new Promise((resolve) => setTimeout(() => resolve(), delaySec * 1000));
}