import main
from starlette.testclient import TestClient

client = TestClient(main.app)

# 1. Health endpoint
r = client.get('/api/v1/health')
assert r.status_code == 200, f'Expected 200, got {r.status_code}'
data = r.json()
assert data['status'] == 'healthy'
assert data['model_loaded'] is True
print('✓ Health check endpoint verified')

# 2. Prediction endpoint (camelCase frontend format)
r = client.post('/api/v1/predict/churn', json={
    'tenureMonths': 2,
    'monthlyCharges': 105.0,
    'contract': 'Month-to-month',
    'techSupport': 'No',
    'internetService': 'Fiber optic'
})
assert r.status_code == 200
pdata = r.json()
assert 'churn_prediction' in pdata
assert 'churn_probability' in pdata
assert pdata['risk_level'] in ['High', 'Medium', 'Low']
assert len(pdata['risk_factors']) > 0
assert 'recommended_action' in pdata
print(f"✓ Predict endpoint verified (Prob: {pdata['churn_probability']}%, Risk: {pdata['risk_level']})")

# 3. LTV endpoint
r = client.post('/api/v1/predict/ltv', json={
    'tenureMonths': 12,
    'monthlyCharges': 80.0
})
assert r.status_code == 200
ltv_data = r.json()
assert 'estimated_ltv' in ltv_data
assert 'ltv_segment' in ltv_data
print(f"✓ LTV endpoint verified (${ltv_data['estimated_ltv']}, {ltv_data['ltv_segment']})")

# 4. Metrics summary
r = client.get('/api/v1/metrics/summary')
assert r.status_code == 200
mdata = r.json()
assert 'totalCustomers' in mdata
assert 'overallChurnRate' in mdata
assert 'averageLtv' in mdata
assert 'revenueAtRisk' in mdata
print('✓ Metrics summary endpoint verified')

# 5. Churn distribution
r = client.get('/api/v1/metrics/churn-distribution')
assert r.status_code == 200
cdist = r.json()
assert len(cdist) == 10
print('✓ Churn distribution endpoint verified')

# 6. Risk distribution
r = client.get('/api/v1/metrics/risk-distribution')
assert r.status_code == 200
rdist = r.json()
assert len(rdist) == 3
print('✓ Risk distribution endpoint verified')

# 7. Contract churn
r = client.get('/api/v1/metrics/contract-churn')
assert r.status_code == 200
cchurn = r.json()
assert len(cchurn) == 3
print('✓ Contract churn endpoint verified')

# 8. LTV cohorts
r = client.get('/api/v1/metrics/ltv-cohorts')
assert r.status_code == 200
lcohorts = r.json()
assert len(lcohorts) == 6
print('✓ LTV cohorts endpoint verified')

# 9. Customers list
r = client.get('/api/v1/customers?limit=5&riskLevel=High')
assert r.status_code == 200
custs = r.json()
assert len(custs) == 5
assert all(c['riskLevel'] == 'High' for c in custs)
print(f"✓ Customers directory verified ({len(custs)} High Risk accounts returned)")

# 10. Single customer
cid = custs[0]['id']
r = client.get(f'/api/v1/customers/{cid}')
assert r.status_code == 200
print(f"✓ Single customer lookup verified for {cid}")

# 11. Retention action dispatch
r = client.post('/api/v1/retention-action', json={'customerId': cid, 'action': 'Offer 20% discount'})
assert r.status_code == 200
print('✓ Retention action dispatch verified')

print('\nALL 11 BACKEND TEST CASES PASSED!')
