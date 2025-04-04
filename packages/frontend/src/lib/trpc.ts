import { createTRPCProxyClient, TRPCClientError, httpBatchLink, loggerLink } from '@trpc/client'
import type { AppRouter } from '@whisper-webui/backend/src/trpc/router'
import { whisperStore } from 'src/stores/WhisperStore.ts'
import superjson from 'superjson'

const store = whisperStore()

const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    loggerLink({
      enabled: (opts) => true,
      logger: (opts) => {
        // catch all the errors returned by the server
        if (opts.direction === 'down' && opts.result instanceof Error) {
          const error = opts.result

          if (error instanceof TRPCClientError) {
            // display all errors cought
            console.log(error.data)
            // @ts-ignore in case of error 401, redirect to the expired page
            if (error?.data?.httpStatus === 401)
              window.location.href = '/expired'
            
          } 
          else {
            console.error('Unexpected Error from trpc logger:', error)
          }
        }
      },
    }),
    httpBatchLink({
      url: `https://${store.getDomain()}/api/trpc`,
    }),
  ],
})


export default trpc

