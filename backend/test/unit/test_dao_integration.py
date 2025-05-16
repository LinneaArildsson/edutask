import pytest

from unittest.mock import patch
from src.util.dao import DAO

from pymongo.errors import WriteError
from bson import ObjectId

@pytest.fixture
def dao_mock():
    with patch('src.util.dao.pymongo.MongoClient') as mock_mongo_client, \
         patch('src.util.dao.getValidator') as mock_get_validator:
        yield DAO('test_collection')

# Test case: Valid Input Creation
@pytest.mark.integration
def test_valid_input_creation(dao_mock):
    valid_data = {'name': 'Test'}
    result = dao_mock.create(valid_data)

    assert result is not None

# Test case: Checks if the create method returns the newly created document with an _id attribute when insertion is successful.
@pytest.mark.integration
def test_create_return_document_with_id(dao_mock):
    valid_data = {'name': 'Test'}
    result = dao_mock.create(valid_data)

    assert '_id' in result

# Test case: Invalid Input Creation
@pytest.mark.integration
def test_invalid_input_creation(dao_mock):
    invalid_data = {'age': 25}  # Missing required 'name' property

    with pytest.raises(WriteError):
        dao_mock.create(invalid_data)

# Test case: Duplicate Entry Creation
@pytest.mark.integration
def test_duplicate_entry_creation(dao_mock):
    existing_data = {'_id': ObjectId(), 'name': 'Existing'}

    with pytest.raises(WriteError):
        dao_mock.create(existing_data)

# Test case: Verifies that the create method correctly handles unique constraint violations specified in the validator. 
#            It tries to insert two documents with the same email, expecting an exception due to the unique constraint violation.
@pytest.mark.integration
def test_create_unique_constraint(dao_mock):
    data1 = {"name": "John", "age": 30}
    dao_mock.create(data1)

    data2 = {"name": "John", "age": 35}

    with pytest.raises(WriteError):
        dao_mock.create(data2)

# Test case: Database Connection Failure
@pytest.mark.integration
def test_database_connection_failure(dao_mock, monkeypatch):
    def mock_mongo_client(*args, **kwargs):
        raise ConnectionError("Connection error")
  
    with pytest.raises(ConnectionError):
        dao_mock.create({'name': 'Test'})

# Test case: Validator Enforcement
@pytest.mark.integration
def test_validator_enforcement(dao_mock):
    invalid_data = {'name': 123}  # Invalid data type for 'name'

    with pytest.raises(WriteError):
        dao_mock.create(invalid_data)

# Test case: Performance Testing
@pytest.mark.integration
def test_performance_testing(dao_mock):
    num_objects = 1000
    test_data = [{'name': f'Test{i}'} for i in range(num_objects)]
    
    for data in test_data:
        result = dao_mock.create(data)
        assert result is not None
