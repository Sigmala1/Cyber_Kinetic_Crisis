import asyncio
import httpx
import os

API_BASE_URL = os.getenv("COMPANY_API_URL", "https://company-stg.criticalasset.com")
USERNAME = os.getenv("COMPANY_API_USER", "aaron@insuremep.com")
PASSWORD = os.getenv("COMPANY_API_PASS", "Insuremep@2026")
CLIENT_ID = os.getenv("COMPANY_API_CLIENT_ID", "ca_6af07aa10b5e2f63652eeb24c850b169")

async def test():
    headers = {"X-Application-Client-Id": CLIENT_ID}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_BASE_URL}/rentals/wrk-ufgxkm54avvi",
            auth=(USERNAME, PASSWORD),
            headers=headers
        )
        print(f"Status: {response.status_code}")
        print(response.text[:200])

asyncio.run(test())
