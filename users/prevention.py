import numpy as np
import joblib

def predict_disease_from_features(model, scaler, feature_1, feature_2, feature_3, feature_4, feature_5, feature_6, feature_7, feature_8, threshold=0.5):

    input_features = np.array([[feature_1, feature_2, feature_3, feature_4, feature_5, feature_6, feature_7, feature_8,]])
    if scaler is not None:
        input_features = scaler.transform(input_features)

    probability = model.predict_proba(input_features)[:, 1][0]
    predicted_label = int(probability >= threshold)

    return predicted_label, probability

# result, prob = predict_disease_from_features(loaded_model, scaler, 50,	110,	80,	1,	1,	0,	1, 22, threshold=0.3)
# print(f"Predicted Label: {result}, Probability: {prob:.4f}")