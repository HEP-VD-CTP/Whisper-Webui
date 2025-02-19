import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@whisper-webui/lib/src/trpc/router';
import { whisperStore } from 'src/stores/WhisperStore.ts';
import superjson from 'superjson';

const store = whisperStore();

const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `https://${store.getDomain()}/api/trpc`,
    }),
  ],
});

export default trpc;

