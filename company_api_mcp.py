import httpx
import uvicorn
import os
from mcp.server.fastmcp import FastMCP
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

mcp = FastMCP("Company API")

# Configuration from environment variables for GCP migration
API_BASE_URL = os.getenv("COMPANY_API_URL", "https://company-stg.criticalasset.com")
USERNAME = os.getenv("COMPANY_API_USER", "john.doe@bluewave.com")
PASSWORD = os.getenv("COMPANY_API_PASS", "Criticalasset@2026")
CORS_ORIGIN = os.getenv("FAST_CORS_ORIGIN", "*")

@mcp.tool()
async def get_data(endpoint: str) -> str:
    """Fetch data from the company API"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_BASE_URL}/{endpoint}",
            auth=(USERNAME, PASSWORD)
        )
        return response.text

@mcp.custom_route("/api/devices", methods=["GET"])
async def get_devices_rest(request):
    """REST endpoint for the web dashboard"""
    async with httpx.AsyncClient() as client:
        # Note: In a real scenario, we would map the company API nodes to our dashboard model
        response = await client.get(
            f"{API_BASE_URL}/rentals/wrk-ufgxkm54avvi",
            auth=(USERNAME, PASSWORD)
        )
        # For demo purposes, we return a success status and the raw data
        return JSONResponse({
            "status": "success",
            "source": f"{API_BASE_URL}",
            "data": response.json() if response.status_code == 200 else {"error": "upstream_failure"}
        })

@mcp.custom_route("/api/health", methods=["GET"])
async def health_check(request):
    return JSONResponse({"status": "healthy", "service": "cyber-kinetic-backend"})

# Create the base application
app = mcp.sse_app()

# Add CORS middleware to allow the Vite dashboard to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
