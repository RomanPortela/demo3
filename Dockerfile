# Utilizar una imagen base más robusta (slim) para evitar problemas de compatibilidad en VPS
FROM node:20-slim AS base

# 1. Instalar dependencias
FROM base AS deps
WORKDIR /app

# Instalar dependencias necesarias para compilar algunos paquetes si fuera necesario
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci

# 2. Constructor
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar telemetría y configurar variables de construcción
ENV NEXT_TELEMETRY_DISABLED 1
# Si el build falla por lint o tipos, puedes descomentar estas líneas:
# ENV NEXT_PUBLIC_SKIP_LINT=true
# ENV NEXT_PUBLIC_SKIP_TYPESCRIPT_CHECK=true

RUN npm run build

# 3. Imagen de ejecución
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Configurar permisos
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar el rastro de salida standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
# El host debe ser 0.0.0.0 para que sea accesible desde fuera del contenedor
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
