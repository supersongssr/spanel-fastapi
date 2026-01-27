"""
Phase 5 Integration Tests

Tests for:
- Node backend communication (Mu API / WebAPI)
- Shop purchase logic
- Payment system
"""

import asyncio
import httpx


BASE_URL = "http://localhost:8000/app/api/v0"


class TestPhase5:
    """Phase 5 Integration Tests"""

    def __init__(self):
        self.client = httpx.AsyncClient()
        self.token = None
        self.mu_key = "default-mu-key-please-change"

    async def test_auth_login(self):
        """Test authentication and get token"""
        print("\n[1] Testing Authentication...")

        response = await self.client.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": "admin@test.com",
                "password": "password123"
            }
        )

        data = response.json()
        print(f"   Status: {response.status_code}")

        if response.status_code == 200 and data.get("ret") == 1:
            self.token = data["data"]["access_token"]
            print(f"   ✓ Token obtained: {self.token[:50]}...")
            return True
        else:
            print(f"   ✗ Login failed: {data}")
            return False

    async def test_node_get_users(self):
        """Test node API: GET /node/users"""
        print("\n[2] Testing Node API - Get Users...")

        response = await self.client.get(
            f"{BASE_URL}/node/users",
            headers={"Key": self.mu_key}
        )

        data = response.json()
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            user_count = data.get("data", {}).get("count", 0)
            print(f"   ✓ Retrieved {user_count} users")
            return True
        else:
            print(f"   ✗ Failed: {data}")
            return False

    async def test_node_traffic_report(self):
        """Test node API: POST /node/traffic"""
        print("\n[3] Testing Node API - Report Traffic...")

        traffic_data = {
            "node_id": 1,
            "data": [
                {
                    "user_id": 1,
                    "u": 1048576,  # 1 MB upload
                    "d": 2097152   # 2 MB download
                }
            ]
        }

        response = await self.client.post(
            f"{BASE_URL}/node/traffic",
            json=traffic_data,
            headers={"Key": self.mu_key}
        )

        data = response.json()
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            updated = data.get("data", {}).get("updated_count", 0)
            print(f"   ✓ Updated {updated} users")
            return True
        else:
            print(f"   ✗ Failed: {data}")
            return False

    async def test_node_online_report(self):
        """Test node API: POST /node/online"""
        print("\n[4] Testing Node API - Report Online Users...")

        online_data = {
            "node_id": 1,
            "online": 45,
            "load": "0.25"
        }

        response = await self.client.post(
            f"{BASE_URL}/node/online",
            json=online_data,
            headers={"Key": self.mu_key}
        )

        data = response.json()
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            online = data.get("data", {}).get("online")
            print(f"   ✓ Reported {online} online users")
            return True
        else:
            print(f"   ✗ Failed: {data}")
            return False

    async def test_shop_get_packages(self):
        """Test shop API: GET /user/shop"""
        print("\n[5] Testing Shop API - Get Packages...")

        response = await self.client.get(
            f"{BASE_URL}/user/shop",
            headers={"Authorization": f"Bearer {self.token}"}
        )

        data = response.json()
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            count = data.get("data", {}).get("count", 0)
            print(f"   ✓ Retrieved {count} packages")
            return True
        else:
            print(f"   ✗ Failed: {data}")
            return False

    async def test_payment_create_order(self):
        """Test payment API: POST /payment/create"""
        print("\n[6] Testing Payment API - Create Order...")

        response = await self.client.post(
            f"{BASE_URL}/payment/create",
            json={"total": 100.00, "gateway": "alipay"},
            headers={"Authorization": f"Bearer {self.token}"}
        )

        data = response.json()
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            order_id = data.get("data", {}).get("order_id")
            total = data.get("data", {}).get("total")
            print(f"   ✓ Order created: ID={order_id}, Amount={total}")
            return True, order_id
        else:
            print(f"   ✗ Failed: {data}")
            return False, None

    async def test_payment_get_orders(self):
        """Test payment API: GET /payment/orders"""
        print("\n[7] Testing Payment API - Get Orders...")

        response = await self.client.get(
            f"{BASE_URL}/payment/orders",
            headers={"Authorization": f"Bearer {self.token}"}
        )

        data = response.json()
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            count = data.get("data", {}).get("count", 0)
            print(f"   ✓ Retrieved {count} orders")
            return True
        else:
            print(f"   ✗ Failed: {data}")
            return False

    async def test_node_invalid_key(self):
        """Test node API with invalid key"""
        print("\n[8] Testing Node API - Invalid Key...")

        response = await self.client.get(
            f"{BASE_URL}/node/users",
            headers={"Key": "invalid-key-123"}
        )

        data = response.json()
        print(f"   Status: {response.status_code}")

        if response.status_code == 401:
            print(f"   ✓ Correctly rejected invalid key")
            return True
        else:
            print(f"   ✗ Should have returned 401")
            return False

    async def run_all_tests(self):
        """Run all Phase 5 tests"""
        print("=" * 60)
        print("Phase 5 Integration Tests")
        print("=" * 60)

        results = []

        # Test 1: Auth
        results.append(await self.test_auth_login())

        if not results[0]:
            print("\n✗ Authentication failed, stopping tests")
            return

        # Test 2-4: Node APIs
        results.append(await self.test_node_get_users())
        results.append(await self.test_node_traffic_report())
        results.append(await self.test_node_online_report())

        # Test 5: Shop API
        results.append(await self.test_shop_get_packages())

        # Test 6-7: Payment APIs
        success, _ = await self.test_payment_create_order()
        results.append(success)
        results.append(await self.test_payment_get_orders())

        # Test 8: Security
        results.append(await self.test_node_invalid_key())

        # Summary
        print("\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)
        passed = sum(results)
        total = len(results)
        print(f"Passed: {passed}/{total}")

        if passed == total:
            print("✓ All tests passed!")
        else:
            print(f"✗ {total - passed} test(s) failed")

        print("=" * 60)

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


async def main():
    """Main test runner"""
    tester = TestPhase5()

    try:
        await tester.run_all_tests()
    finally:
        await tester.close()


if __name__ == "__main__":
    asyncio.run(main())
