import { useEffect } from 'react'
import { useAuroraStore } from '../store'
import axios from 'axios'

export function useProviderStatus() {
  const { updateProvider, setApiKeys } = useAuroraStore()

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [healthResp, keysResp] = await Promise.allSettled([
          axios.get('http://localhost:8082/health', { timeout: 3000 }),
          axios.get('http://localhost:8082/api/keys', { timeout: 3000 }),
        ])

        if (healthResp.status === 'fulfilled') {
          const providers = healthResp.value.data?.providers || {}
          Object.entries(providers).forEach(([name, info]: [string, any]) => {
            updateProvider(name, {
              status: info.status === 'active' ? 'active' : info.status === 'error' ? 'error' : 'unknown',
              errorCount: info.error_count || 0,
            })
          })
        }

        if (keysResp.status === 'fulfilled') {
          setApiKeys(keysResp.value.data?.keys || [])
        }
      } catch {}
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [updateProvider, setApiKeys])
}

