import { supabase } from '../lib/supabase';

export interface DropdownList {
  id: string;
  name: string;
  label: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DropdownOption {
  id: string;
  listId: string;
  value: string;
  label: string;
  displayOrder: number;
}

export interface DropdownsMap {
  [listName: string]: DropdownOption[];
}

// Cache dropdowns in memory with 5-minute TTL
let dropdownsCache: { data: DropdownsMap; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchAllDropdowns(): Promise<DropdownsMap> {
  // Check cache
  if (dropdownsCache && Date.now() - dropdownsCache.timestamp < CACHE_TTL) {
    return dropdownsCache.data;
  }

  try {
    // Fetch lists and their options
    const { data: lists, error: listsError } = await supabase
      .from('dropdown_lists')
      .select('id, name, label');

    if (listsError) throw listsError;
    if (!lists || lists.length === 0) return {};

    const listIds = lists.map(l => l.id);

    const { data: options, error: optionsError } = await supabase
      .from('dropdown_options')
      .select('id, list_id, value, label, display_order')
      .in('list_id', listIds)
      .order('display_order', { ascending: true });

    if (optionsError) throw optionsError;

    // Group options by list name
    const result: DropdownsMap = {};
    lists.forEach(list => {
      result[list.name] = (options || [])
        .filter(opt => opt.list_id === list.id)
        .map(opt => ({
          id: opt.id,
          listId: opt.list_id,
          value: opt.value,
          label: opt.label,
          displayOrder: opt.display_order,
        }));
    });

    // Cache the result
    dropdownsCache = { data: result, timestamp: Date.now() };
    return result;
  } catch (err) {
    console.error('Error fetching dropdowns:', err);
    return {};
  }
}

export function clearDropdownsCache() {
  dropdownsCache = null;
}

export async function fetchDropdownList(listName: string): Promise<DropdownOption[]> {
  const allDropdowns = await fetchAllDropdowns();
  return allDropdowns[listName] || [];
}

export async function addDropdownOption(
  listName: string,
  value: string,
  label: string
): Promise<void> {
  try {
    // Get list ID
    const { data: list, error: listError } = await supabase
      .from('dropdown_lists')
      .select('id')
      .eq('name', listName)
      .single();

    if (listError) throw listError;
    if (!list) throw new Error(`Dropdown list "${listName}" not found`);

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('dropdown_options')
      .select('display_order')
      .eq('list_id', list.id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = (maxOrder?.[0]?.display_order ?? -1) + 1;

    // Insert new option
    const { error } = await supabase
      .from('dropdown_options')
      .insert({
        list_id: list.id,
        value,
        label,
        display_order: nextOrder,
      });

    if (error) throw error;
    clearDropdownsCache();
  } catch (err) {
    console.error(`Error adding dropdown option to "${listName}":`, err);
    throw err;
  }
}

export async function removeDropdownOption(optionId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('dropdown_options')
      .delete()
      .eq('id', optionId);

    if (error) throw error;
    clearDropdownsCache();
  } catch (err) {
    console.error('Error removing dropdown option:', err);
    throw err;
  }
}

export async function reorderDropdownOptions(
  listName: string,
  optionIds: string[]
): Promise<void> {
  try {
    // Update display_order for all options
    const updates = optionIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('dropdown_options')
        .update({ display_order: update.display_order })
        .eq('id', update.id);

      if (error) throw error;
    }

    clearDropdownsCache();
  } catch (err) {
    console.error('Error reordering dropdown options:', err);
    throw err;
  }
}

export async function getDropdownListsForAdmin(): Promise<DropdownList[]> {
  try {
    const { data, error } = await supabase
      .from('dropdown_lists')
      .select('id, name, label, description, created_at, updated_at')
      .order('label');

    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      label: d.label,
      description: d.description,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  } catch (err) {
    console.error('Error fetching dropdown lists for admin:', err);
    throw err;
  }
}
