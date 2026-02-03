import React, { createContext, useContext, useState } from 'react';

const LayoutContext = createContext({
    headerActions: null,
    setHeaderActions: () => { },
});

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider = ({ children }) => {
    const [headerActions, setHeaderActions] = useState(null);

    return (
        <LayoutContext.Provider value={{ headerActions, setHeaderActions }}>
            {children}
        </LayoutContext.Provider>
    );
};
