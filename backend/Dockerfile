# Global build arguments
ARG WHISPER_MODEL=large-v3

# ---- Base Image ----
# Includes system packages and ROCm repo. This is shared between builder and runner.
FROM ubuntu:24.04 AS base

# Avoid interactive tz / apt prompts
ENV DEBIAN_FRONTEND=noninteractive

# ---- ROCm apt repo (AMD's repo has rocm-dev / hipblas / hipblas-dev) ----
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
    && curl -fsSL https://repo.radeon.com/rocm/rocm.gpg.key \
        | gpg --dearmor -o /etc/apt/keyrings/rocm.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/rocm.gpg] https://repo.radeon.com/rocm/apt/7.2.4 noble main" \
        > /etc/apt/sources.list.d/rocm.list \
    && rm -rf /var/lib/apt/lists/*

# ---- System runtime and build deps ----
RUN apt-get update && apt-get install -y --no-install-recommends \
        ffmpeg \
        git \
        cmake \
        build-essential \
        libcurl4-openssl-dev \
        libssl-dev \
        pkg-config \
        wget \
        rocm-dev \
        hipblas-dev \
        hipblas-common-dev \
        rocblas-dev/7.2.4 \
        hipcc/7.2.4 \
        rocm-cmake/7.2.4 \
        rocm-utils/7.2.4 \
        software-properties-common \
    && add-apt-repository -y ppa:deadsnakes/ppa \
    && apt-get install -y --no-install-recommends python3.11 python3.11-venv python3.11-dev \
    && rm -rf /var/lib/apt/lists/*

# ---- Stage 2: Whisper.cpp Builder ----
# Since this stage does not COPY any files from the build context, it will be 100% cached
# and never run again when local files change.
FROM base AS whisper-builder

WORKDIR /app

ARG WHISPER_CPP_REPO=https://github.com/ggerganov/whisper.cpp.git
ARG WHISPER_CPP_REF=master
RUN git clone --depth 1 --branch ${WHISPER_CPP_REF} ${WHISPER_CPP_REPO} /app/whisper.cpp \
    && cd /app/whisper.cpp \
    && cmake -B build \
        -DGGML_HIP=ON \
        -DAMDGPU_TARGETS="gfx1100;gfx1151;gfx1200;gfx1201" \
        -DGGML_CUDA_FA=OFF \
        -DCMAKE_BUILD_TYPE=Release \
        -DWHISPER_BUILD_TESTS=OFF \
        -DWHISPER_BUILD_SERVER=OFF \
    && cmake --build build --config Release -- -j"$(nproc)" \
    && ls -la build/bin/whisper-cli

# Download Whisper model inside builder stage
ARG WHISPER_MODEL
RUN bash /app/whisper.cpp/models/download-ggml-model.sh ${WHISPER_MODEL} /app/whisper.cpp/models \
    && ls -lh /app/whisper.cpp/models/ggml-${WHISPER_MODEL}.bin

# ---- Stage 3: Final Runner Stage ----
FROM base AS runner

WORKDIR /app

# Copy the built whisper-cli binary and the downloaded model from whisper-builder
COPY --from=whisper-builder /app/whisper.cpp/build/bin/whisper-cli /app/whisper.cpp/build/bin/whisper-cli
COPY --from=whisper-builder /app/whisper.cpp/models /app/whisper.cpp/models

# Set whisper.cpp model environment variables
ARG WHISPER_MODEL
ENV WHISPER_MODEL_PATH=/app/whisper.cpp/models/ggml-${WHISPER_MODEL}.bin

# ---- uv for fast Python deps ----
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# ---- Python app deps ----
COPY pyproject.toml ./
# No uv.lock in lockstep with new deps (we removed faster-whisper);
# uv will resolve a fresh lock at build time.
RUN uv sync --no-dev

# ---- App source ----
COPY . .

EXPOSE 8000

CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
