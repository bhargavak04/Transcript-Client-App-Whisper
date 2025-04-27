from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Create SQLite database
db_path = os.path.join(os.path.dirname(__file__), 'transcripts.db')
engine = create_engine(f'sqlite:///{db_path}', echo=True)
Session = sessionmaker(bind=engine)
db_session = Session  # For legacy usage
from sqlalchemy.orm import scoped_session
scoped_db_session = scoped_session(Session)
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    transcripts = relationship("Transcript", back_populates="user", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }

class Transcript(Base):
    __tablename__ = 'transcripts'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    duration = Column(Float, nullable=False)  # Duration in seconds
    language = Column(String, nullable=True)  # Language code (e.g., 'en')
    status = Column(String, default='processing')
    job_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="transcripts")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'text': self.text,
            'duration': self.duration,
            'language': self.language,
            'status': self.status,
            'job_id': self.job_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Create all tables
Base.metadata.create_all(engine)