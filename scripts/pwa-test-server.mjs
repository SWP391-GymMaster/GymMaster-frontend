import { createServer, request as createProxyRequest } from "node:http"
import { spawn } from "node:child_process"

const proxyHost = "127.0.0.1"
const proxyPort = 3200
const upstreamPort = 3201
const forcedFailureHeader = "x-gymmaster-pwa-test-network-error"

const nextProcess = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--port",
    String(upstreamPort),
    "--hostname",
    proxyHost,
  ],
  {
    env: process.env,
    stdio: "inherit",
  },
)

const proxy = createServer((incomingRequest, outgoingResponse) => {
  const shouldForceNetworkError =
    incomingRequest.headers[forcedFailureHeader] === "1" &&
    incomingRequest.url?.startsWith("/member/dashboard")

  if (shouldForceNetworkError) {
    incomingRequest.socket.destroy()
    return
  }

  const proxyRequest = createProxyRequest(
    {
      headers: incomingRequest.headers,
      host: proxyHost,
      method: incomingRequest.method,
      path: incomingRequest.url,
      port: upstreamPort,
    },
    (proxyResponse) => {
      outgoingResponse.writeHead(
        proxyResponse.statusCode ?? 502,
        proxyResponse.statusMessage,
        proxyResponse.headers,
      )
      proxyResponse.pipe(outgoingResponse)
    },
  )

  proxyRequest.on("error", () => {
    if (!outgoingResponse.headersSent) {
      outgoingResponse.writeHead(502, { "content-type": "text/plain; charset=utf-8" })
    }
    outgoingResponse.end("PWA test upstream is not ready")
  })

  incomingRequest.pipe(proxyRequest)
})

proxy.listen(proxyPort, proxyHost)

let stopping = false
function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  proxy.close(() => process.exit(exitCode))
  nextProcess.kill()
  setTimeout(() => process.exit(exitCode), 2_000).unref()
}

nextProcess.on("exit", (code, signal) => {
  if (!stopping) {
    console.error(`Next.js PWA test server exited (${signal ?? code ?? "unknown"})`)
    stop(code ?? 1)
  }
})

process.on("SIGINT", () => stop())
process.on("SIGTERM", () => stop())
