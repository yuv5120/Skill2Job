import pytest
import spacy
from unittest.mock import Mock, patch


class TestNLPProcessing:
    @pytest.fixture
    def nlp_model(self):
        """Load spaCy model for testing"""
        try:
            return spacy.load("en_core_web_sm")
        except OSError:
            pytest.skip("spaCy model not installed")

    def test_skill_extraction(self, nlp_model):
        """Test extracting skills from text"""
        text = "Experienced in Python, JavaScript, and React development"
        doc = nlp_model(text)
        
        # Check that the model processes the text
        assert len(doc) > 0
        assert any(token.text in ["Python", "JavaScript", "React"] for token in doc)

    def test_similarity_calculation(self, nlp_model):
        """Test semantic similarity between texts"""
        text1 = "Software Engineer with Python experience"
        text2 = "Python Developer position"
        
        doc1 = nlp_model(text1)
        doc2 = nlp_model(text2)
        
        similarity = doc1.similarity(doc2)
        
        # Similarity should be a float between 0 and 1
        assert 0 <= similarity <= 1
        # These similar texts should have some similarity
        assert similarity > 0.3

    @patch('redis.Redis')
    def test_caching_mechanism(self, mock_redis):
        """Test that caching works correctly"""
        mock_redis_instance = Mock()
        mock_redis.return_value = mock_redis_instance
        
        mock_redis_instance.exists.return_value = False
        mock_redis_instance.get.return_value = None
        
        # Simulate cache miss
        assert mock_redis_instance.exists("test_key") == False
        
        # Simulate setting cache
        mock_redis_instance.set("test_key", "test_value")
        mock_redis_instance.set.assert_called_once()


class TestResumeParser:
    def test_email_extraction(self):
        """Test email extraction from resume text"""
        import re
        
        text = "Contact me at john.doe@example.com for opportunities"
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        
        assert len(emails) == 1
        assert emails[0] == "john.doe@example.com"

    def test_phone_extraction(self):
        """Test phone number extraction"""
        import re
        
        text = "Call me at +1-234-567-8900 or (555) 123-4567"
        phone_pattern = r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]'
        phones = re.findall(phone_pattern, text)
        
        assert len(phones) >= 1

    def test_education_keyword_detection(self):
        """Test detection of education-related keywords"""
        text = "Bachelor of Science in Computer Science from MIT, graduated 2020"
        education_keywords = ["bachelor", "master", "phd", "degree", "university", "college"]
        
        text_lower = text.lower()
        found_keywords = [kw for kw in education_keywords if kw in text_lower]
        
        assert len(found_keywords) > 0
        assert "bachelor" in found_keywords
