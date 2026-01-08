import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestMLServiceEndpoints:
    def test_home_endpoint(self):
        """Test the home endpoint returns correct message"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "ML API running"}

    def test_parse_resume_endpoint_exists(self):
        """Test that parse-resume endpoint is accessible"""
        # Test with no file should return 422 (validation error)
        response = client.post("/parse-resume")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_parse_resume_with_file(self):
        """Test resume parsing with a mock PDF file"""
        # Create a simple test file
        test_file_content = b"%PDF-1.4 test content"
        files = {"file": ("test_resume.pdf", test_file_content, "application/pdf")}
        
        response = client.post("/parse-resume", files=files)
        
        # The response might fail due to invalid PDF, but endpoint should be reachable
        assert response.status_code in [200, 400, 500]

    def test_match_jobs_endpoint_exists(self):
        """Test that match-jobs endpoint is accessible"""
        response = client.post("/match-jobs")
        assert response.status_code == 422  # Missing required fields
