const LOCAL_STORAGE_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

export interface RecentSearchItem {
  query: string;
  timestamp: number;
}

export const getRecentSearches = (): RecentSearchItem[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const addRecentSearch = (query: string) => {
  if (!query || query.trim() === '') return;
  
  const q = query.trim();
  let searches = getRecentSearches();
  
  // Remove if it already exists
  searches = searches.filter(item => item.query.toLowerCase() !== q.toLowerCase());
  
  // Add to front
  searches.unshift({ query: q, timestamp: Date.now() });
  
  // Cap length
  if (searches.length > MAX_RECENT_SEARCHES) {
    searches = searches.slice(0, MAX_RECENT_SEARCHES);
  }
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(searches));
};

export const clearRecentSearches = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};
