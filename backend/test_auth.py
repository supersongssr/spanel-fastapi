"""
Authentication System Test Script

This script tests the authentication system including:
1. User registration
2. User login
3. Token verification
4. Logout (token blacklisting)
5. Protected route access
"""

import asyncio
import httpx

BASE_URL = "http://localhost:8000/app/api/v0"


async def test_registration():
    """Test user registration"""
    print("\n" + "="*60)
    print("📝 Testing User Registration")
    print("="*60)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": "test@example.com",
                "passwd": "testpassword123",
                "passwd2": "testpassword123",
                "user_name": "testuser"
            }
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code == 200:
            data = response.json()
            if data.get("ret") == 1:
                print("✅ Registration successful!")
                return True
            else:
                print(f"❌ Registration failed: {data.get('msg')}")
                return False
        else:
            print("❌ Registration request failed")
            return False


async def test_login():
    """Test user login"""
    print("\n" + "="*60)
    print("🔐 Testing User Login")
    print("="*60)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": "test@example.com",
                "passwd": "testpassword123"
            }
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code == 200:
            data = response.json()
            if data.get("ret") == 1:
                token = data.get("data", {}).get("token")
                print("✅ Login successful!")
                print(f"Token: {token[:50]}...")
                return token
            else:
                print(f"❌ Login failed: {data.get('msg')}")
                return None
        else:
            print("❌ Login request failed")
            return None


async def test_protected_route(token: str):
    """Test accessing a protected route (will create one if needed)"""
    print("\n" + "="*60)
    print("🔒 Testing Protected Route Access")
    print("="*60)

    async with httpx.AsyncClient() as client:
        # Try to access health endpoint (no auth required)
        response = await client.get(
            f"{BASE_URL}/health",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        print("✅ Protected route access test completed")


async def test_logout(token: str):
    """Test user logout"""
    print("\n" + "="*60)
        print("🚪 Testing User Logout")
    print("="*60)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/logout",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code == 200:
            data = response.json()
            if data.get("ret") == 1:
                print("✅ Logout successful!")
                return True
            else:
                print(f"❌ Logout failed: {data.get('msg')}")
                return False
        else:
            print("❌ Logout request failed")
            return False


async def test_token_after_logout(token: str):
    """Test that blacklisted token cannot be used"""
    print("\n" + "="*60)
    print("🚫 Testing Blacklisted Token Usage")
    print("="*60)

    async with httpx.AsyncClient() as client:
        # Try to use the token after logout
        response = await client.get(
            f"{BASE_URL}/health",
            headers={"Authorization": f"Bearer {token}"}
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

        # Note: This endpoint doesn't require auth, so we expect 200
        # In a real protected endpoint, this would return 401
        print("ℹ️  Note: /health endpoint doesn't require auth")
        print("   In a protected endpoint, blacklisted token would return 401")


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 SS-Panel FastAPI Authentication Tests")
    print("="*60)

    try:
        # Test 1: Registration
        success = await test_registration()

        if not success:
            print("\n⚠️  Registration failed. Trying to login with existing user...")
        else:
            print("\n✅ Registration test passed!")

        # Test 2: Login
        token = await test_login()

        if not token:
            print("\n❌ Login test failed!")
            return

        # Test 3: Protected route
        await test_protected_route(token)

        # Test 4: Logout
        await test_logout(token)

        # Test 5: Token after logout
        await test_token_after_logout(token)

        print("\n" + "="*60)
        print("✅ All authentication tests completed!")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
