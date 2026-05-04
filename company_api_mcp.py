import httpx
import uvicorn
import os
from mcp.server.fastmcp import FastMCP
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

mcp = FastMCP("Company API")

# Configuration from environment variables for GCP migration
API_BASE_URL = os.getenv("COMPANY_API_URL", "https://company-stg.criticalasset.com")
USERNAME = os.getenv("COMPANY_API_USER", "aaron@insuremep.com")
PASSWORD = os.getenv("COMPANY_API_PASS", "Insuremep@2026")
CLIENT_ID = os.getenv("COMPANY_API_CLIENT_ID", "ca_6af07aa10b5e2f63652eeb24c850b169")
CORS_ORIGIN = os.getenv("FAST_CORS_ORIGIN", "*")

@mcp.tool()
async def get_data(endpoint: str) -> str:
    """Fetch data from the company API"""
    headers = {"X-Application-Client-Id": CLIENT_ID}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{API_BASE_URL}/{endpoint}",
            auth=(USERNAME, PASSWORD),
            headers=headers
        )
        return response.text

@mcp.custom_route("/api/devices", methods=["GET"])
async def get_devices_rest(request):
    """REST endpoint for the web dashboard"""
    headers = {"X-Application-Client-Id": CLIENT_ID}
    async with httpx.AsyncClient() as client:
        # Note: In a real scenario, we would map the company API nodes to our dashboard model
        response = await client.get(
            f"{API_BASE_URL}/rentals/wrk-ufgxkm54avvi",
            auth=(USERNAME, PASSWORD),
            headers=headers
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

MOCK_DEVICES = [
    {
        "id": "NET-GW-01", "name": "Core Gateway", "type": "Server",
        "securityTier": 1, "has2FA": True,
        "isOn": True, "isOnline": True, "hasPassword": True, "condition": "Needs Maintenance",
        "cyberState": "Normal", "lastMaintainedDate": "2024-06-12",
        "authorizedRoles": ["IT Admin"], "activeUsers": 5, "dependencies": [],
        "location": {"city": "Seattle", "state": "WA", "country": "USA", "building": "HQ", "room": "Server Room 1"},
        "openPorts": [80, 443, 22, 53], "ipAddress": "10.0.0.1/16", "systemCategory": "Electrical",
        "components": [
            {"name": "Primary NIC", "securityTier": 1, "has2FA": True, "cyberState": "Normal"},
            {"name": "Firmware v3.2", "securityTier": 2, "has2FA": True, "cyberState": "Normal"},
            {"name": "Management Interface", "securityTier": 1, "has2FA": False, "cyberState": "Warning"},
        ],
    },
    {
        "id": "HVAC-01", "name": "Main Air Handler", "type": "HVAC",
        "securityTier": 2, "has2FA": True,
        "isOn": True, "isOnline": True, "hasPassword": True, "condition": "Optimal",
        "cyberState": "Normal", "lastMaintainedDate": "2026-01-15",
        "authorizedRoles": ["Admin", "Maintenance"], "activeUsers": 1, "dependencies": ["NET-GW-01", "TEMP-SENS-12"],
        "location": {"city": "Seattle", "state": "WA", "country": "USA", "building": "HQ", "room": "Roof Deck"},
        "openPorts": [502, 8080], "ipAddress": "10.0.1.15/16", "systemCategory": "Mechanical",
        "components": [
            {"name": "Main Controller Board", "securityTier": 2, "has2FA": True, "cyberState": "Normal"},
            {"name": "Temperature Sensor Array", "securityTier": 3, "has2FA": False, "cyberState": "Normal"},
            {"name": "Network Module", "securityTier": 2, "has2FA": False, "cyberState": "Normal"},
        ],
    },
    {
        "id": "TEMP-SENS-12", "name": "Lobby Temperature", "type": "IoT Sensor",
        "securityTier": 3, "has2FA": False,
        "isOn": True, "isOnline": False, "hasPassword": False, "condition": "Degraded",
        "cyberState": "Warning", "lastMaintainedDate": "2025-11-20",
        "authorizedRoles": ["Admin"], "activeUsers": 0, "dependencies": ["NET-GW-01"],
        "location": {"city": "Seattle", "state": "WA", "country": "USA", "building": "HQ", "room": "Main Lobby"},
        "openPorts": [], "ipAddress": "10.0.2.112/16", "systemCategory": "Electrical",
        "components": [
            {"name": "Sensor Core", "securityTier": 3, "has2FA": False, "cyberState": "Warning"},
            {"name": "Radio Module", "securityTier": 4, "has2FA": False, "cyberState": "Normal"},
        ],
    },
    {
        "id": "AC-DOOR-05", "name": "Server Room Lock", "type": "Access Control",
        "securityTier": 2, "has2FA": False,
        "isOn": True, "isOnline": True, "hasPassword": True, "condition": "Optimal",
        "cyberState": "Compromised", "lastMaintainedDate": "2026-03-01",
        "authorizedRoles": ["Admin", "Security"], "activeUsers": 2, "dependencies": ["CAM-09", "NET-GW-01"],
        "location": {"city": "Seattle", "state": "WA", "country": "USA", "building": "HQ", "room": "Server Room 1 Door"},
        "openPorts": [443, 1883], "ipAddress": "10.0.3.50/16", "systemCategory": "Electrical",
        "components": [
            {"name": "Lock Mechanism", "securityTier": 2, "has2FA": False, "cyberState": "Compromised"},
            {"name": "RFID Reader", "securityTier": 2, "has2FA": False, "cyberState": "Compromised"},
            {"name": "Camera Module", "securityTier": 3, "has2FA": False, "cyberState": "Normal"},
        ],
    },
    {
        "id": "CAM-09", "name": "Server Room Camera", "type": "Security Camera",
        "securityTier": 3, "has2FA": False,
        "isOn": True, "isOnline": True, "hasPassword": True, "condition": "Optimal",
        "cyberState": "Normal", "lastMaintainedDate": "2026-02-14",
        "authorizedRoles": ["Security"], "activeUsers": 1, "dependencies": ["NET-GW-01"],
        "location": {"city": "Seattle", "state": "WA", "country": "USA", "building": "HQ", "room": "Server Room 1"},
        "openPorts": [554, 80], "ipAddress": "10.0.4.155/16", "systemCategory": "Electrical",
        "components": [
            {"name": "Image Processor", "securityTier": 3, "has2FA": False, "cyberState": "Normal"},
            {"name": "Infrared Array", "securityTier": 4, "has2FA": False, "cyberState": "Normal"},
            {"name": "Network Interface", "securityTier": 3, "has2FA": False, "cyberState": "Normal"},
        ],
    },
    {
        "id": "HVAC-02", "name": "Exhaust Fan C", "type": "HVAC",
        "securityTier": 4, "has2FA": False,
        "isOn": False, "isOnline": False, "hasPassword": False, "condition": "Optimal",
        "cyberState": "Normal", "lastMaintainedDate": "2026-03-20",
        "authorizedRoles": ["Maintenance"], "activeUsers": 0, "dependencies": ["HVAC-01"],
        "location": {"city": "Seattle", "state": "WA", "country": "USA", "building": "HQ", "room": "Utility Shaft 3"},
        "openPorts": [502], "ipAddress": "10.0.1.16/16", "systemCategory": "Mechanical",
        "components": [
            {"name": "Fan Motor Controller", "securityTier": 4, "has2FA": False, "cyberState": "Normal"},
            {"name": "Power Supply Unit", "securityTier": 4, "has2FA": False, "cyberState": "Normal"},
        ],
    },
    {
        "id": "ELEV-01", "name": "Main Elevator", "type": "Transport",
        "securityTier": 2, "has2FA": False,
        "isOn": True, "isOnline": True, "hasPassword": True, "condition": "Needs Maintenance",
        "cyberState": "Warning", "lastMaintainedDate": "2025-08-30",
        "authorizedRoles": ["Admin", "Maintenance"], "activeUsers": 0, "dependencies": ["NET-GW-01"],
        "location": {"city": "Seattle", "state": "WA", "country": "USA", "building": "HQ", "room": "Core Shaft"},
        "openPorts": [10001], "ipAddress": "10.0.5.10/16", "systemCategory": "Mechanical",
        "components": [
            {"name": "Main Control Unit", "securityTier": 1, "has2FA": False, "cyberState": "Warning"},
            {"name": "Door Sensor Array", "securityTier": 3, "has2FA": False, "cyberState": "Normal"},
            {"name": "Emergency Comms", "securityTier": 2, "has2FA": False, "cyberState": "Normal"},
        ],
    },
    {
        "id": "PUMP-01", "name": "Chilled Water Pump", "type": "Plumbing",
        "securityTier": 3, "has2FA": False,
        "isOn": True, "isOnline": True, "hasPassword": True, "condition": "Optimal",
        "cyberState": "Normal", "lastMaintainedDate": "2025-10-12",
        "authorizedRoles": ["Maintenance"], "activeUsers": 0, "dependencies": ["HVAC-01", "NET-GW-01"],
        "location": {"city": "Seattle", "state": "WA", "country": "USA", "building": "HQ", "room": "Basement Utility"},
        "openPorts": [502], "ipAddress": "10.0.6.5/16", "systemCategory": "Plumbing",
        "components": [
            {"name": "Pump Controller", "securityTier": 3, "has2FA": False, "cyberState": "Normal"},
            {"name": "Flow Sensor", "securityTier": 4, "has2FA": False, "cyberState": "Normal"},
            {"name": "Network Module", "securityTier": 3, "has2FA": False, "cyberState": "Normal"},
        ],
    },
]

def generate_obligations(node, is_component=False):
    obligations = []
    
    # 1. Condition Obligation
    obligations.append({
        "id": "condition",
        "label": "Optimal Health",
        "description": "Physical and operational condition must be 'Optimal'",
        "status": "met" if node.get("condition") == "Optimal" else "unmet",
        "criticality": "medium"
    })

    # 2. Cyber State Obligation
    obligations.append({
        "id": "cyber-state",
        "label": "Secure State",
        "description": "Cyber telemetry must report 'Normal' state",
        "status": "met" if node.get("cyberState") == "Normal" else "unmet",
        "criticality": "high"
    })

    if not is_component:
        # 3. 2FA Obligation
        if node.get("securityTier") in [0, 1, 2]:
            obligations.append({
                "id": "auth-2fa",
                "label": "MFA Enforcement",
                "description": "Tier 0-2 assets require Multi-Factor Authentication",
                "status": "met" if node.get("has2FA") else "unmet",
                "criticality": "high"
            })

        # 4. Connectivity Obligation
        obligations.append({
            "id": "connectivity",
            "label": "Network Presence",
            "description": "Asset must maintain priority connection",
            "status": "met" if node.get("isOnline") else "unmet",
            "criticality": "medium"
        })

        # 5. Power Obligation
        obligations.append({
            "id": "power",
            "label": "Power Stability",
            "description": "Asset must be powered on and stable",
            "status": "met" if node.get("isOn") else "unmet",
            "criticality": "low"
        })

    return obligations

@mcp.tool()
async def run_cyber_audit() -> dict:
    """Run a simulated cyber network scan and return evaluated ISO-27001 obligations for all tracked assets."""
    all_devices = list(MOCK_DEVICES)
    
    # Attempt to fetch live deployment data
    headers = {"X-Application-Client-Id": CLIENT_ID}
    live_data = None
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{API_BASE_URL}/rentals/wrk-ufgxkm54avvi",
                auth=(USERNAME, PASSWORD),
                headers=headers,
                timeout=5.0
            )
            if response.status_code == 200:
                live_data = response.json()
    except Exception:
        pass
        
    if live_data:
        live_device = {
            "id": live_data.get("rental_id", "CA-CLOUD-01"),
            "name": live_data.get("name", "CriticalAsset Environment"),
            "type": "Cloud Instance",
            "securityTier": 1,
            "has2FA": True,
            "isOn": live_data.get("status") == "Running",
            "isOnline": live_data.get("status") == "Running",
            "hasPassword": True,
            "condition": "Optimal",
            "cyberState": "Normal",
            "lastMaintainedDate": live_data.get("created_at", "2026-04-01").split("T")[0],
            "authorizedRoles": ["Admin"],
            "activeUsers": 1,
            "dependencies": ["NET-GW-01"],
            "location": {"city": "Cloud", "state": "Virtual", "country": "Global", "building": "Data Center", "room": "Instance Node"},
            "openPorts": live_data.get("network", {}).get("active_ports", [22, 443]),
            "ipAddress": live_data.get("ssh_command", "@Unknown").split("@")[1] if "ssh_command" in live_data else "Dynamic IP",
            "systemCategory": "Compute",
            "components": [
                {"name": f"vCPUs: {live_data.get('resources', {}).get('vcpus', 'N/A')}", "securityTier": 1, "has2FA": False, "cyberState": "Normal"},
                {"name": f"RAM: {live_data.get('resources', {}).get('ram_gb', 'N/A')} GB", "securityTier": 1, "has2FA": False, "cyberState": "Normal"},
            ],
        }
        all_devices.insert(0, live_device)
        
    enriched_devices = []
    all_obligations = []
    
    for device in all_devices:
        device_copy = dict(device)
        device_copy["obligations"] = generate_obligations(device_copy)
        
        enriched_components = []
        for comp in device_copy.get("components", []):
            comp_copy = dict(comp)
            comp_copy["obligations"] = generate_obligations(comp_copy, is_component=True)
            enriched_components.append(comp_copy)
            all_obligations.extend(comp_copy["obligations"])
            
        device_copy["components"] = enriched_components
        all_obligations.extend(device_copy["obligations"])
        enriched_devices.append(device_copy)
        
    total_obligations = len(all_obligations)
    met_obligations = sum(1 for o in all_obligations if o["status"] == "met")
    fulfillment_rate = round((met_obligations / total_obligations) * 100) if total_obligations > 0 else 0
    critical_failures = sum(1 for o in all_obligations if o["status"] == "unmet" and o["criticality"] == "high")
    
    return {
        "status": "success",
        "totalNodes": len(enriched_devices),
        "fulfillmentRate": f"{fulfillment_rate}%",
        "criticalFailures": critical_failures,
        "devices": enriched_devices
    }

@mcp.tool()
async def get_device_topology() -> dict:
    """Return the network topology and dependencies of all tracked cyber assets."""
    topology = {}
    for device in MOCK_DEVICES:
        topology[device["id"]] = {
            "name": device["name"],
            "dependencies": device["dependencies"],
            "securityTier": device["securityTier"],
            "cyberState": device["cyberState"]
        }
    return {
        "status": "success",
        "topology": topology
    }

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
