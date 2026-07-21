import { createContext,useContext } from 'react'
export type Toast={message:string;type:'success'|'error'}
export const ToastContext=createContext<{push:(message:string,type?:Toast['type'])=>void}>({push:()=>undefined})
export function useToast(){return useContext(ToastContext)}
