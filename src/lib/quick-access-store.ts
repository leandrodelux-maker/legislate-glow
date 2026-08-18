import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";

export type QuickAccessItem = {
  id?: string;
  label: string;
  url: string;
  icon: string;
  ordem?: number;
  ativo?: boolean;
};

interface QuickAccessState {
  items: QuickAccessItem[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<QuickAccessItem, "id">) => Promise<void>;
  removeItem: (labelOrId: string) => Promise<void>;
}

export const useQuickAccessStore = create<QuickAccessState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchItems: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
          .from("acesso_rapido")
          .select("*")
          .eq("ativo", true)
          .order("ordem", { ascending: true });

        if (!error && data) {
          set({ items: data as QuickAccessItem[], isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },

      addItem: async (item) => {
        const { data, error } = await supabase
          .from("acesso_rapido")
          .insert([item as any])
          .select()
          .single();

        if (!error && data) {
          set((state) => ({ items: [...state.items, data as QuickAccessItem] }));
        }
      },

      removeItem: async (labelOrId) => {
        const { error } = await supabase
          .from("acesso_rapido")
          .delete()
          .or(`label.eq.${labelOrId},id.eq.${labelOrId}`);

        if (!error) {
          set((state) => ({
            items: state.items.filter((i) => i.label !== labelOrId && i.id !== labelOrId),
          }));
        }
      },
    }),
    {
      name: "quick-access-storage",
    }
  )
);
