from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_hashing_and_verification():
    password = "StrongPass123"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong", hashed) is False


def test_access_token_creation_and_decoding():
    token = create_access_token(user_id=1, email="test@example.com")
    payload = decode_access_token(token)

    assert payload["sub"] == "1"
    assert payload["email"] == "test@example.com"
    assert payload["type"] == "access"
