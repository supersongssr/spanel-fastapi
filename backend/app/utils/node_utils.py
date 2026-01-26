"""
Node Utility Functions

This module contains common utility functions for node operations,
following DRY (Don't Repeat Yourself) principles.
"""

from datetime import datetime
from app.models.node import Node


async def check_node_online(node: Node) -> bool:
    """
    Check if node is online based on heartbeat

    Args:
        node: Node object

    Returns:
        True if node is online (heartbeat within 5 minutes)
    """
    if node.node_heartbeat == 0:
        return False

    # Consider node offline if no heartbeat in 5 minutes (300 seconds)
    heartbeat_threshold = 300
    current_time = int(datetime.now().timestamp())
    return (current_time - node.node_heartbeat) < heartbeat_threshold


def get_node_type_name(sort: int) -> str:
    """
    Get human-readable node type name

    Args:
        sort: Node sort value from database

    Returns:
        Node type string (ss, ssr, vmess, vless, trojan)
    """
    type_mapping = {
        0: "ss",      # Shadowsocks
        1: "ssr",     # ShadowsocksR
        2: "ssr",
        3: "ssr",
        4: "ssr",
        5: "ssr",
        6: "ssr",
        7: "ssr",
        8: "ssr",
        9: "ssr",
        11: "vmess",  # V2Ray VMess
        13: "vless",  # V2Ray VLess
        14: "trojan"  # Trojan
    }
    return type_mapping.get(sort, "ss")


def bytes_to_gb(bytes_value: int) -> float:
    """
    Convert bytes to gigabytes (GB)

    Args:
        bytes_value: Value in bytes

    Returns:
        Value in GB (rounded to 2 decimal places)
    """
    return round(bytes_value / (1024**3), 2)


def calculate_traffic_percent(used: int, total: int) -> float:
    """
    Calculate traffic usage percentage

    Args:
        used: Used traffic in bytes
        total: Total traffic limit in bytes

    Returns:
        Usage percentage (rounded to 2 decimal places)
    """
    if total == 0:
        return 0.0
    return round((used / total) * 100, 2)


def format_traffic_rate(rate: float) -> str:
    """
    Format traffic rate multiplier to string

    Args:
        rate: Traffic rate multiplier

    Returns:
        Formatted string (e.g., "1x", "2.5x")
    """
    return f"{rate}x" if rate != 1 else "1x"


def get_last_heartbeat_timestamp(heartbeat: int) -> str | None:
    """
    Convert heartbeat timestamp to ISO format string

    Args:
        heartbeat: Unix timestamp

    Returns:
        ISO format datetime string or None
    """
    if heartbeat == 0:
        return None
    return datetime.fromtimestamp(heartbeat).isoformat()
