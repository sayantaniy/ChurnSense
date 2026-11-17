"""
Customer Lifetime Value (LTV) calculation module.
Provides both rule-based and churn-risk-adjusted revenue projections.
"""

from typing import Dict, Any, Optional


def estimate_ltv(
    monthly_charges: float,
    total_charges: float,
    tenure: int,
    projection_period: int = 36,
    churn_probability: Optional[float] = None,
) -> float:
    """
    Estimate projected customer revenue over a projection period (default 36 months).
    If churn_probability (0.0 to 1.0) is supplied, adjusts remaining revenue projection
    by the retention probability (1 - churn_probability).
    """
    monthly_charges = float(monthly_charges)
    total_charges = float(total_charges)
    tenure = int(tenure)

    remaining_months = max(projection_period - tenure, 0)

    if churn_probability is not None and 0.0 <= churn_probability <= 1.0:
        retention_weight = max(1.0 - churn_probability, 0.15)
        projected_future = monthly_charges * remaining_months * retention_weight
    else:
        projected_future = monthly_charges * remaining_months

    projected_value = total_charges + projected_future
    return round(float(projected_value), 2)


def get_ltv_segment(estimated_ltv: float, churn_probability: float = 0.0) -> str:
    """
    Classify customer into an LTV tier based on value and churn risk:
    - At-Risk: Churn probability >= 0.65
    - VIP: LTV >= $4,000 and low/medium churn risk
    - Growth: LTV >= $2,000 and < $4,000
    - Core: LTV < $2,000
    """
    if churn_probability >= 0.65:
        return "At-Risk"
    if estimated_ltv >= 4000:
        return "VIP"
    if estimated_ltv >= 2000:
        return "Growth"
    return "Core"


def calculate_ltv_breakdown(
    monthly_charges: float,
    total_charges: float,
    tenure: int,
    churn_probability: float = 0.0,
    projection_period: int = 36,
) -> Dict[str, Any]:
    """
    Returns full LTV telemetry breakdown for API responses.
    """
    ltv = estimate_ltv(
        monthly_charges=monthly_charges,
        total_charges=total_charges,
        tenure=tenure,
        projection_period=projection_period,
        churn_probability=churn_probability,
    )
    segment = get_ltv_segment(ltv, churn_probability)

    return {
        "estimated_ltv": ltv,
        "ltv_segment": segment,
        "projection_period_months": projection_period,
        "historical_billed": round(float(total_charges), 2),
        "tenure_months": tenure,
        "monthly_run_rate": round(float(monthly_charges), 2),
        "method": f"{projection_period}-month risk-weighted projection",
    }
