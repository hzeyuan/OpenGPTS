import { create } from 'zustand';
import { persist } from 'zustand/middleware';


type Props = {
    exposed?: boolean;
    setExposed: (exposed: boolean) => void;
}


const useLayoutStore = create<Props>()(
    persist(
        (set, get) => ({
            exposed: false,
            setExposed: (exposed) => {
                set((state) => ({
                    exposed: exposed
                }))
            }
        }),
        {
            name: 'layout-store',
            partialize: (state) => ({
                exposed: state.exposed
            })
        }
    )
)

export default useLayoutStore;
