import bcrypt

def generate_password_hash(password):
    """Generate bcrypt hash for admin password"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

if __name__ == "__main__":
    print("=== Orrya Admin Password Generator ===")
    print()
    
    # Get username and password from user
    username = input("Enter your desired admin username: ").strip()
    password = input("Enter your desired admin password: ").strip()
    
    if not username or not password:
        print("Error: Username and password cannot be empty!")
        exit(1)
    
    # Generate hash
    print("\nGenerating secure password hash...")
    hash_result = generate_password_hash(password)
    
    print("\n" + "="*50)
    print("✅ Your admin credentials:")
    print("="*50)
    print(f"Username: {username}")
    print(f"Password Hash: {hash_result}")
    print()
    print("📝 Add these to your .env file:")
    print(f"ADMIN_USERNAME={username}")
    print(f"ADMIN_PASSWORD_HASH={hash_result}")
    print("="*50)
