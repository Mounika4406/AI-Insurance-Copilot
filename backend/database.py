import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Numeric, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres@localhost:5432/insurance_copilot")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    policies = relationship("Policy", back_populates="user", cascade="all, delete-orphan")
    bills = relationship("MedicalBill", back_populates="user", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="user", cascade="all, delete-orphan")

class Policy(Base):
    __tablename__ = "policies"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="policies")
    claims = relationship("Claim", back_populates="policy")

class MedicalBill(Base):
    __tablename__ = "medical_bills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    filepath = Column(String(255), nullable=False)
    hospital_name = Column(String(255))
    diagnosis = Column(String(255))
    amount = Column(Numeric)
    bill_date = Column(Date)
    extracted_text = Column(Text)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bills")
    claims = relationship("Claim", back_populates="bill")

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="SET NULL"), nullable=True)
    bill_id = Column(Integer, ForeignKey("medical_bills.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="Pending") # 'Eligible', 'Ineligible', 'Pending'
    approval_probability = Column(Numeric) # predicted approval probability in % (e.g. 94)
    missing_documents = Column(Text) # comma-separated missing docs
    recommendation = Column(Text)
    analysis_date = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="claims")
    policy = relationship("Policy", back_populates="claims")
    bill = relationship("MedicalBill", back_populates="claims")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database tables...")
    init_db()
    print("Database tables initialized successfully!")
