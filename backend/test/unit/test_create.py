from bson import ObjectId
import pytest
from pymongo import MongoClient
from src.util.dao import DAO

from pymongo.errors import WriteError

@pytest.fixture(scope="module")
def mongo_client():
    client = MongoClient("mongodb://localhost:27017")
    yield client

    client.edutask.test_collection.drop()

@pytest.fixture
def dao(mongo_client):
    database = mongo_client.edutask

    schema = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["name", "age"],
            "properties": {
                "name": {
                    "bsonType": "string",
                    "description": "the name of a person",
                    "uniqueItems": True
                }, 
                "age": {
                    "bsonType": "int",
                    "description": "the age of a person"
                },
                "address": {
                    "bsonType": "object",
                    "properties": {
                        "city": {"bsonType": "string"},
                        "country": {"bsonType": "string"}
                    }
                }
            }
        }
    }

    database.create_collection("test_collection", validator=schema)

    yield DAO(collection_name="test_collection")

    database.test_collection.drop()


# Test case to verify that the create method successfully inserts a document into the collection when the input data complies with the validator.
def test_create_success(dao):
    data = {"name": "John", "age": 30}

    created_document = dao.create(data)

    assert created_document is not None
    assert "_id" in created_document

# Test case to ensure that the create method raises an exception when the input data does not comply with the validator.
def test_create_invalid_data(dao):
    invalid_data = {"age": 25} # Missing required field

    with pytest.raises(WriteError):
        dao.create(invalid_data)

# Test case to check if the create method returns the newly created document with an _id attribute when insertion is successful.
def test_create_return_document_with_id(dao):
    data = {"name": "Alice", "age": 35}

    created_document = dao.create(data)

    assert created_document["_id"] is not None

# Test case to verify that the create method correctly handles unique constraint violations specified in the validator.
def test_create_unique_constraint(dao):
    data1 = {"name": "John", "age": 30}
    data2 = {"name": "John", "age": 35}

    dao.create(data1)

    with pytest.raises(WriteError):
        dao.create(data2)

def test_database_connection_failure(dao, monkeypatch):
    def mock_mongo_client(*args, **kwargs):
        raise ConnectionError("Connection error")
  
    with pytest.raises(ConnectionError):
        dao.create({'name': 'Test'})

def test_validator_enforcement(dao):
    invalid_data = {'name': 123}  # Invalid data type for 'name'

    with pytest.raises(WriteError):
        dao.create(invalid_data)
