import secrets
import string 

def generate_room_code() -> str: 
    alphabet = string.ascii_uppercase + string.digits
    
    return ''.join(secrets.choice(alphabet) for _ in range(6))