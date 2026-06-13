import pytest

@pytest.mark.integration
@pytest.mark.asyncio
async def test_smoke(async_client):
    
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Gym API is running"}
