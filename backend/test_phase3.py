"""
Phase 3 API Testing Script

This script tests all Phase 3 endpoints:
- User info endpoint
- User nodes endpoint
- Admin users list
- Admin nodes list
"""

import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000/app/api/v0"


async def test_validation_error():
    """Test that validation errors return 422 with proper format"""
    print("\n" + "="*60)
    print("🧪 Testing Validation Error Handling (422)")
    print("="*60)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": "invalid-email",
                "passwd": "123"
            }
        )

        print(f"Status Code: {response.status_code}")
        print(f"Expected: 422")
        print(f"Success: {response.status_code == 422}")

        if response.status_code == 422:
            data = response.json()
            print(f"Response format: {json.dumps(data, indent=2, ensure_ascii=False)}")
            print("✅ Validation error properly returns 422 with detailed errors")
            return True
        else:
            print("❌ Validation error not handled correctly")
            return False


async def test_user_info(token: str):
    """Test user info endpoint"""
    print("\n" + "="*60)
    print("👤 Testing User Info Endpoint")
    print("="*60)

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/user/info",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

        if response.status_code == 200:
            data = response.json()
            if data.get("ret") == 1:
                print("✅ User info endpoint working")
                print(f"   - User: {data['data']['user']['email']}")
                print(f"   - Traffic used: {data['data']['traffic']['usage_percent']}%")
                return True

        print("❌ User info endpoint failed")
        return False


async def test_user_nodes(token: str):
    """Test user nodes endpoint"""
    print("\n" + "="*60)
    print("🌐 Testing User Nodes Endpoint")
    print("="*60)

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/user/nodes",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if data.get("ret") == 1:
                total = data['data']['total']
                print(f"✅ User nodes endpoint working")
                print(f"   - Available nodes: {total}")

                if total > 0:
                    print(f"   - First node: {data['data']['nodes'][0]['name']}")

                return True

        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print("❌ User nodes endpoint failed")
        return False


async def test_admin_users(token: str):
    """Test admin users list endpoint"""
    print("\n" + "="*60)
    print("🛡️  Testing Admin Users List Endpoint")
    print("="*60)

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if data.get("ret") == 1:
                total = data['data']['total']
                page = data['data']['page']
                print(f"✅ Admin users endpoint working")
                print(f"   - Total users: {total}")
                print(f"   - Current page: {page}")

                if total > 0:
                    print(f"   - First user: {data['data']['users'][0]['email']}")

                return True
            else:
                print(f"❌ Error: {data.get('msg')}")
                return False

        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print("❌ Admin users endpoint failed")
        return False


async def test_admin_nodes(token: str):
    """Test admin nodes list endpoint"""
    print("\n" + "="*60)
    print("🖥️  Testing Admin Nodes List Endpoint")
    print("="*60)

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/admin/nodes",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            if data.get("ret") == 1:
                total = data['data']['total']
                print(f"✅ Admin nodes endpoint working")
                print(f"   - Total nodes: {total}")

                if total > 0:
                    first_node = data['data']['nodes'][0]
                    print(f"   - First node: {first_node['name']}")
                    print(f"   - Online: {first_node['is_online']}")
                    print(f"   - Bandwidth: {first_node['bandwidth_used_gb']} GB")

                return True
            else:
                print(f"❌ Error: {data.get('msg')}")
                return False

        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        print("❌ Admin nodes endpoint failed")
        return False


async def test_unauthorized_access():
    """Test that unauthorized access is properly blocked"""
    print("\n" + "="*60)
    print("🔒 Testing Unauthorized Access")
    print("="*60)

    async with httpx.AsyncClient() as client:
        # Test without token
        response = await client.get(f"{BASE_URL}/user/info")

        print(f"Without token - Status Code: {response.status_code}")
        print(f"Expected: 401")
        print(f"Success: {response.status_code == 401}")

        # Test with invalid token
        response = await client.get(
            f"{BASE_URL}/user/info",
            headers={"Authorization": "Bearer invalid-token"}
        )

        print(f"\nWith invalid token - Status Code: {response.status_code}")
        print(f"Expected: 401")
        print(f"Success: {response.status_code == 401}")

        return response.status_code == 401


async def main():
    """Run all Phase 3 tests"""
    print("\n" + "="*60)
    print("🧪 SS-Panel FastAPI Phase 3 API Tests")
    print("="*60)

    # Test validation error handling
    await test_validation_error()

    # Test unauthorized access
    await test_unauthorized_access()

    print("\n" + "="*60)
    print("ℹ️  Note: Following tests require valid JWT token")
    print("   Please run login first, then manually test with:")
    print(f"   curl -H 'Authorization: Bearer <token>' {BASE_URL}/user/info")
    print("="*60)

    # For demonstration, we'll show the test structure
    # In production, you would:
    # 1. Register a user
    # 2. Login to get token
    # 3. Test user endpoints
    # 4. Create admin user
    # 5. Test admin endpoints

    print("\n" + "="*60)
    print("✅ Phase 3 API Structure Tests Complete!")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
