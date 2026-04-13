import httpx
import uvicorn
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Company API")

API_BASE_URL = "https://company-stg.criticalasset.com"
USERNAME = "john.doe@bluewave.com"
PASSWORD = "Criticalasset@2026"

@mcp.tool()
async def get_data(endpoint: str) -> str:
    """Fetch data from the company API"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_BASE_URL}/{endpoint}",
            auth=(USERNAME, PASSWORD)
        )
        return response.text

if __name__ == "__main__":
    uvicorn.run(mcp.sse_app(), host="0.0.0.0", port=8080)
