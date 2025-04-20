'use client';

import React, { useRef, useContext, createContext } from 'react'
import { stickyElementType } from '../types';

export const refContext = createContext<stickyElementType>(undefined);
export function useRefContext(){

    const context = useContext(refContext);

    if(context === null || context === undefined){

        throw new Error(`Wrong context element type.`);
    }

    return context;
}

function RefContextHook({children}: {children?: React.ReactNode}) {
    
    const ref = useRef<stickyElementType>([]);
    
    return (
        <refContext.Provider value={ref}>
            {children}
        </refContext.Provider>
    );
}

export default RefContextHook;