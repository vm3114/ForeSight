import numpy as np
import pickle

def load_model_from_pickle(file_path):
    with open(file_path, 'rb') as f:
        imported = pickle.load(f)
    return imported['model'], imported['label_encoder'], imported['class_weights']

def predict_disease_from_features(model, *features):
    if len(features) != 15:
        raise ValueError(f"Expected 15 features, but received {len(features)} features.")
    
    input_features = np.array(features, dtype=np.float32).reshape(1, -1)
    
    probability_vector = model.predict_proba(input_features)[0]
    
    predicted_index = int(np.argmax(probability_vector))
    predicted_probability = float(probability_vector[predicted_index])
    
    return predicted_index, predicted_probability

model_path = "model_with_weights.pkl"
loaded_model, loaded_encoder, loaded_weights = load_model_from_pickle(model_path)

test_features = [np.nan, 2.5, 3.0, np.nan] + [np.nan] * 11
print(f"Total features provided: {len(test_features)}")

predicted_index, prob = predict_disease_from_features(loaded_model, *test_features)

decoded_label = loaded_encoder.inverse_transform([predicted_index])[0]

print(f"\nPredicted Label: {decoded_label}")
print(f"Prediction Probability: {prob:.4f}")
print(f"Class Weights: {loaded_weights}")