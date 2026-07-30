import { useMemo, useState } from 'react'
import { searchPatents } from '../services/patentService'

export function useSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actions = useMemo(
    () => ({
      async runSearch() {
        setLoading(true)
        setError(null)

        try {
          return await searchPatents()
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : 'Unable to complete search')
          return null
        } finally {
          setLoading(false)
        }
      },
    }),
    [],
  )

  return { loading, error, ...actions }
}