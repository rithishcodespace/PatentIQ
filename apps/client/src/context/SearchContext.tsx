import { createContext, useContext, useState, type ReactNode } from 'react'

type SearchContextValue = {
  query: string
  setQuery: (value: string) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')

  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>
}

export function useSearchContext() {
  const context = useContext(SearchContext)

  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider')
  }

  return context
}