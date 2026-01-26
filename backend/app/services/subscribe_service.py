"""
Subscription Service

This module handles subscription link generation for different protocols.
Compatible with original SS-Panel subscription format.
"""

import base64
import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.user import User
from app.models.node import Node
from app.utils.node_utils import get_node_type_name, check_node_online


class SubscriptionService:
    """
    Subscription Link Generation Service

    Generates subscription content for different client protocols:
    - SS (Shadowsocks)
    - SSR (ShadowsocksR)
    - VMess (V2Ray)
    - Trojan
    """

    @staticmethod
    async def get_user_nodes(
        db: AsyncSession,
        user: User
    ) -> List[Node]:
        """
        Get available nodes for user based on level and group

        Args:
            db: Database session
            user: User object

        Returns:
            List of available nodes
        """
        result = await db.execute(
            select(Node).where(
                and_(
                    Node.type != 0,  # Visible nodes only
                    Node.node_class <= user.class_level,
                    (user.node_group == 0) | (Node.node_group == user.node_group)
                )
            ).order_by(Node.node_sort)
        )
        return result.scalars().all()

    @staticmethod
    def generate_ss_link(node: Node, user: User) -> str:
        """
        Generate Shadowsocks subscription link

        Format: ss://base64(method:password@server:port)#name

        Args:
            node: Node object
            user: User object

        Returns:
            SS link string
        """
        # NEVER expose user's login password (pass field)
        # Only use passwd (SS connection password)
        method = user.method
        password = user.passwd
        server = node.server
        port = user.port
        name = node.name

        # Create SS link
        userinfo = f"{method}:{password}@{server}:{port}"
        encoded = base64.b64encode(userinfo.encode()).decode().rstrip("=")
        link = f"ss://{encoded}#{name}"

        return link

    @staticmethod
    def generate_ssr_link(node: Node, user: User) -> str:
        """
        Generate ShadowsocksR subscription link

        Format: ssr://base64(server:port:protocol:method:obfs:passwordbase64?params)#name

        Args:
            node: Node object
            user: User object

        Returns:
            SSR link string
        """
        server = node.server
        port = user.port
        protocol = user.protocol if user.protocol else "origin"
        method = user.method
        obfs = user.obfs if user.obfs else "plain"
        password = base64.b64encode(user.passwd.encode()).decode().rstrip("=")
        name = node.name

        # SSR parameters
        params = {
            "obfsparam": user.obfs_param if user.obfs_param else "",
            "protoparam": user.protocol_param if user.protocol_param else "",
            "remarks": base64.b64encode(name.encode()).decode().rstrip("="),
            "group": base64.b64encode("SSPanel".encode()).decode().rstrip("=")
        }

        # Create SSR link
        userinfo = f"{server}:{port}:{protocol}:{method}:{obfs}:{password}/?{params}"
        encoded = base64.b64encode(userinfo.encode()).decode().rstrip("=")
        link = f"ssr://{encoded}"

        return link

    @staticmethod
    def generate_vmess_link(node: Node, user: User) -> str:
        """
        Generate V2Ray VMess subscription link

        Format: vmess://base64(json_config)

        Args:
            node: Node object
            user: User object

        Returns:
            VMess link string
        """
        import json

        config = {
            "v": "2",
            "ps": node.name,
            "add": node.server,
            "port": str(user.port),
            "id": user.v2ray_uuid if user.v2ray_uuid else str(uuid.uuid4()),
            "aid": "0",
            "net": "tcp",
            "type": "none",
            "host": "",
            "path": "",
            "tls": ""
        }

        json_str = json.dumps(config)
        encoded = base64.b64encode(json_str.encode()).decode().rstrip("=")
        link = f"vmess://{encoded}"

        return link

    @staticmethod
    def generate_trojan_link(node: Node, user: User) -> str:
        """
        Generate Trojan subscription link

        Format: trojan://password@server:port?params#name

        Args:
            node: Node object
            user: User object

        Returns:
            Trojan link string
        """
        password = user.passwd
        server = node.server
        port = user.port
        name = node.name

        link = f"trojan://{password}@{server}:{port}?peer={server}#{name}"
        return link

    @staticmethod
    async def generate_subscription(
        db: AsyncSession,
        user: User,
        subtype: str = "ss"
    ) -> str:
        """
        Generate subscription content based on subtype

        Args:
            db: Database session
            user: User object
            subtype: Subscription type (ss, ssr, vmess, trojan)

        Returns:
            Subscription content (Base64 encoded or plain text)
        """
        nodes = await SubscriptionService.get_user_nodes(db, user)
        links = []

        for node in nodes:
            node_type = get_node_type_name(node.sort)

            # Match node type with requested subscription type
            if subtype == "ss" and node_type == "ss":
                links.append(SubscriptionService.generate_ss_link(node, user))
            elif subtype == "ssr" and node_type == "ssr":
                links.append(SubscriptionService.generate_ssr_link(node, user))
            elif subtype == "vmess" and node_type == "vmess":
                links.append(SubscriptionService.generate_vmess_link(node, user))
            elif subtype == "trojan" and node_type == "trojan":
                links.append(SubscriptionService.generate_trojan_link(node, user))

        # Join links with newlines and Base64 encode
        content = "\n".join(links)
        encoded_content = base64.b64encode(content.encode()).decode()

        return encoded_content

    @staticmethod
    async def generate_auto_subscription(
        db: AsyncSession,
        user: User
    ) -> str:
        """
        Generate auto-detect subscription (supports all types)

        Args:
            db: Database session
            user: User object

        Returns:
            Subscription content with all supported protocols
        """
        nodes = await SubscriptionService.get_user_nodes(db, user)
        links = []

        for node in nodes:
            node_type = get_node_type_name(node.sort)

            # Generate appropriate link based on node type
            if node_type == "ss":
                links.append(SubscriptionService.generate_ss_link(node, user))
            elif node_type == "ssr":
                links.append(SubscriptionService.generate_ssr_link(node, user))
            elif node_type == "vmess":
                links.append(SubscriptionService.generate_vmess_link(node, user))
            elif node_type == "trojan":
                links.append(SubscriptionService.generate_trojan_link(node, user))

        # Join and encode
        content = "\n".join(links)
        encoded_content = base64.b64encode(content.encode()).decode()

        return encoded_content
