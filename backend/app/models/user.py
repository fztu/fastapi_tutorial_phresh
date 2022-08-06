import string
from typing import Optional
from xml.dom import minicompat

from pydantic import EmailStr, constr, validator

from app.models.core import DateTimeModelMixin, IDModelMixin, CoreModel

def validate_username(username: str) -> str:
    allowed = string.ascii_letters + string.digits + '_' + "-"
    assert all(c in allowed for c in username), "Username must be ASCII letters, digits, '_', or '-'"
    assert len(username) >= 3, "Username must be at least 3 characters long"
    return username

class UserBase(CoreModel):
    """
    Leaving off password and salt from base model
    """
    email: Optional[EmailStr]
    username: Optional[str]
    email_verified: bool = False
    is_active: bool = True
    is_superuser: bool = False

class UserCreate(UserBase):
    """
    Email, username, and password are required
    """
    email: EmailStr
    password: constr(min_length=7, max_length=100)
    username: constr(min_length=3, regex="^[a-zA-Z0-9_\-]+$")

    @validator('username', pre=True)
    def username_is_valid(cls, username: str) -> str:
        return validate_username(username)

class UserUpdate(CoreModel):
    """
    Users are allowed to update their email and username
    """
    email: Optional[EmailStr]
    username: Optional[constr(min_length=3, regex="^[a-zA-Z0-9_-]+$")]

class UserPasswordUpdate(CoreModel):
    """
    User can change their password only
    """
    password: constr(min_length=7, max_length=100)
    salt: str

class UserInDB(IDModelMixin, DateTimeModelMixin, UserBase):
    """
    Add in id, created_at, updated_at, and user's password and salt
    """
    password: constr(min_length=7, max_length=100)
    salt: str

class UserPublic(IDModelMixin, DateTimeModelMixin, UserBase):
    pass
