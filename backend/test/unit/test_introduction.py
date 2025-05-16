import pytest
from unittest.mock import MagicMock

from src.controllers.usercontroller import UserController

#  --------------------------------------------
# | Test for valid email and single user found |
#  --------------------------------------------
@pytest.mark.unit
def test_oneUser():
    mock_dao = MagicMock()
    mock_dao.find.return_value = [{"email": "user@example.com", "name": "SingleUser"}]

    user_controller = UserController(mock_dao)

    user = user_controller.get_user_by_email("user@example.com")
    assert user == {"email": "user@example.com", "name": "SingleUser"}

#  -----------------------------------------------
# | Test for valid email and multiple users found |
#  -----------------------------------------------
@pytest.mark.unit
def test_multipleUsers():
    mock_dao = MagicMock()
    mock_dao.find.return_value = [{"email": "multiple@example.com", "name": "FirstUser"}, {"email": "multiple@example.com", "name": "SecondUser"}]

    user_controller = UserController(mock_dao)

    user = user_controller.get_user_by_email("multiple@example.com")
    assert user == {"email": "multiple@example.com", "name": "FirstUser"}

#  -----------------------------------------
# | Test for valid email and no users found |
#  -----------------------------------------
@pytest.mark.unit
def test_noUsers():
    mock_dao = MagicMock()
    mock_dao.find.return_value = []

    user_controller = UserController(mock_dao)

    user = user_controller.get_user_by_email("nonexistent@example.com")
    assert user is None

#  ------------------------
# | Test for invalid email |
#  ------------------------
@pytest.mark.unit
def test_invalidEmail():
    mock_dao = MagicMock()

    user_controller = UserController(mock_dao)

    with pytest.raises(ValueError):
        user_controller.get_user_by_email("invalid_email")

#  -------------------------------------
# | Test for database operation failure |
#  -------------------------------------
@pytest.mark.unit
def test_databaseFailure():
    mock_dao = MagicMock()
    mock_dao.find.side_effect = Exception

    user_controller = UserController(mock_dao)

    with pytest.raises(Exception):
        user_controller.get_user_by_email("user@example.com")
