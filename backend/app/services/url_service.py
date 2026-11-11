import random, string

def generate_short_code(length=6):
    """Generate random short code"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))
