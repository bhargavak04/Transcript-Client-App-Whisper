from flask import Blueprint, request, jsonify
from models import Session, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/users', methods=['POST'])
def create_user():
    """Create or update user from Clerk authentication data"""
    data = request.json
    
    if not data.get('user_id') or not data.get('user_name'):
        return jsonify({"error": "User ID and name are required"}), 400
    
    session = Session()
    try:
        # Check if user exists
        user = session.query(User).filter_by(id=data['user_id']).first()
        
        if user:
            # Update existing user
            user.name = data['user_name']
        else:
            # Create new user
            user = User(
                id=data['user_id'],
                name=data['user_name']
            )
            session.add(user)
        
        session.commit()
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    
    finally:
        session.close()

@auth_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user details"""
    session = Session()
    try:
        user = session.query(User).filter_by(id=user_id).first()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        session.close()