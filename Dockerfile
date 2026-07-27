FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2

LABEL org.opencontainers.image.title="OpenLeash Code Scanner" \
      org.opencontainers.image.source="https://github.com/open-leash/plugin-code-scanner" \
      org.opencontainers.image.licenses="Apache-2.0"

WORKDIR /app
COPY plugins/container-runtime/server.mjs ./server.mjs
COPY plugins/plugin-code-scanner/dist ./plugin
COPY packages/shared/dist ./node_modules/@openleash/shared/dist
COPY packages/shared/package.json ./node_modules/@openleash/shared/package.json
RUN chown -R node:node /app
USER node
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=5 CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]

