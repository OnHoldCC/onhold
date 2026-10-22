FROM --platform=$BUILDPLATFORM docker.1ms.run/library/node:24-bookworm-slim AS js-deps
WORKDIR /build
COPY package.json package-lock.json ./
COPY front/package.json ./front/package.json
COPY front/components/singlespark ./front/components/singlespark
RUN npm ci --include=dev

FROM js-deps AS contracts-build
COPY contracts ./contracts
COPY config ./config
RUN npm run contracts:build

FROM contracts-build AS web-build
COPY front ./front
ARG ONHOLD_CHAIN_CONFIG
RUN ONHOLD_CHAIN_CONFIG=$ONHOLD_CHAIN_CONFIG node front/scripts/build.mjs

FROM --platform=$BUILDPLATFORM docker.1ms.run/library/rust:1.94-bookworm AS rust-build
WORKDIR /app
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources \
    && apt-get -o Acquire::Retries=1 -o Acquire::https::Timeout=30 update \
    && apt-get install -y --no-install-recommends gcc-x86-64-linux-gnu libc6-dev-amd64-cross cmake \
    && rm -rf /var/lib/apt/lists/* \
    && rustup target add x86_64-unknown-linux-gnu
ARG TARGETARCH
RUN test "$TARGETARCH" = amd64
ENV CARGO_TARGET_X86_64_UNKNOWN_LINUX_GNU_LINKER=x86_64-linux-gnu-gcc \
    CC_x86_64_unknown_linux_gnu=x86_64-linux-gnu-gcc \
    AR_x86_64_unknown_linux_gnu=x86_64-linux-gnu-ar
WORKDIR /build
COPY backend/Cargo.toml backend/Cargo.lock ./backend/
COPY backend/src ./backend/src
COPY backend/sql ./backend/sql
COPY front/src/fonts/nunito-variable.ttf ./front/src/fonts/nunito-variable.ttf
COPY contracts/buyback-policy.json ./contracts/buyback-policy.json
COPY config ./config
RUN cargo build --locked --release --manifest-path backend/Cargo.toml --target x86_64-unknown-linux-gnu --jobs 2

FROM docker.1ms.run/library/node:24-bookworm-slim AS keeper
WORKDIR /app
ENV NODE_ENV=production ONHOLD_KEEPER_DATA_DIR=/data/keeper
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --workspaces=false --ignore-scripts && npm cache clean --force
COPY backend/scripts/buyback-keeper.mjs backend/scripts/buyback-cycle.mjs ./backend/scripts/
COPY contracts/buyback-policy.json ./contracts/buyback-policy.json
COPY config ./config
COPY --from=contracts-build /build/contracts/artifacts/FlapBuyback.json /build/contracts/artifacts/OnholdMarket.json /build/contracts/artifacts/OnholdGameplayVault.json ./contracts/artifacts/
RUN mkdir -p /data/keeper && chown -R node:node /data
USER node
VOLUME ["/data"]
CMD ["node", "backend/scripts/buyback-keeper.mjs"]

FROM docker.1ms.run/library/debian:bookworm-slim AS api
COPY --from=rust-build /etc/ssl/certs /etc/ssl/certs
RUN mkdir /data && chown 10001:10001 /data
WORKDIR /app
COPY --from=rust-build /build/backend/target/x86_64-unknown-linux-gnu/release/onhold-api /usr/local/bin/onhold-api
COPY --from=web-build --chown=10001:10001 /build/front/dist ./front/dist
ENV ONHOLD_ADDR=0.0.0.0:8080 ONHOLD_DIST_DIR=/app/front/dist ONHOLD_DATA_DIR=/data
USER 10001:10001
EXPOSE 8080
VOLUME ["/data"]
CMD ["/usr/local/bin/onhold-api"]
