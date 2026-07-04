import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    
    # 1. Claim Amount (in INR, mostly between 10k and 500k)
    claim_amount = np.random.exponential(scale=150000, size=num_samples) + 10000
    claim_amount = np.clip(claim_amount, 10000, 1000000)
    
    # 2. Hospital Registered (binary: 1 = Network, 0 = Non-Network)
    hospital_registered = np.random.choice([0, 1], size=num_samples, p=[0.25, 0.75])
    
    # 3. Disease Covered (binary)
    disease_covered = np.random.choice([0, 1], size=num_samples, p=[0.15, 0.85])
    
    # 4. Waiting Period Completed (binary)
    waiting_period_completed = np.random.choice([0, 1], size=num_samples, p=[0.2, 0.8])
    
    # 5. Missing Documents Count (0 to 4)
    missing_docs_count = np.random.choice([0, 1, 2, 3, 4], size=num_samples, p=[0.6, 0.2, 0.1, 0.07, 0.03])
    
    # 6. Policy Age (in months, 0 to 120)
    policy_age_months = np.random.randint(0, 120, size=num_samples)
    
    # 7. Previous Claims Count (0 to 5)
    previous_claims = np.random.choice([0, 1, 2, 3, 4, 5], size=num_samples, p=[0.5, 0.3, 0.1, 0.05, 0.03, 0.02])
    
    # Create DataFrame
    df = pd.DataFrame({
        "claim_amount": claim_amount,
        "hospital_registered": hospital_registered,
        "disease_covered": disease_covered,
        "waiting_period_completed": waiting_period_completed,
        "missing_docs_count": missing_docs_count,
        "policy_age_months": policy_age_months,
        "previous_claims": previous_claims
    })
    
    # Determine base probability of approval
    prob = 0.55
    
    # Applying logical rules for probability adjustments
    prob = np.where(df["disease_covered"] == 0, prob - 0.50, prob)
    prob = np.where(df["hospital_registered"] == 0, prob - 0.10, prob)
    prob = np.where(df["waiting_period_completed"] == 0, prob - 0.25, prob)
    prob = prob - (df["missing_docs_count"] * 0.12)
    prob = np.where(df["policy_age_months"] > 24, prob + 0.10, prob)
    prob = prob - (df["previous_claims"] * 0.04)
    
    # Clamp probabilities to [0.01, 0.99]
    prob = np.clip(prob, 0.01, 0.99)
    
    # Generate binary label (Approved = 1, Rejected = 0) based on probability
    df["approved"] = np.random.binomial(1, prob)
    
    return df

def train_and_save_model():
    print("Generating synthetic historical claim dataset...")
    df = generate_synthetic_data(10000)
    
    # Split into features and target
    X = df.drop(columns=["approved"])
    y = df["approved"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest model on synthetic data...")
    # Train random forest classifier
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    
    # Check accuracy
    accuracy = model.score(X_test, y_test)
    print(f"Model trained. Validation Accuracy: {accuracy * 100:.2f}%")
    
    # Create directory for models if it doesn't exist
    models_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "claim_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
        
    print(f"Model saved successfully to {model_path}!")

if __name__ == "__main__":
    train_and_save_model()
