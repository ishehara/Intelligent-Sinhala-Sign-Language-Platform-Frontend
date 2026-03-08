"""
Sound Alert API Server
======================
Flask REST API for the Environmental Sound Alert ML model.

Run this on your computer (backend):
    cd components/sound-alert
    python src/sound_alert_api.py

Then update API_BASE_URL in services/soundAlertService.ts
with your computer's local IP address.

Endpoints:
    GET  /health           - Health check
    POST /predict-sound    - Predict sound from base64 audio
"""

import sys
import os
import json
import base64
import tempfile
import logging
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger(__name__)

# ── Adjust these paths to match your model location ──────────────
BASE_DIR = Path(__file__).parent.parent  # components/sound-alert/
MODEL_DIR = BASE_DIR / "models" / "vehicle_horns_cnn"
DATA_DIR = BASE_DIR / "data" / "processed" / "vehicle_horns"
# ─────────────────────────────────────────────────────────────────

sys.path.insert(0, str(Path(__file__).parent))

app = Flask(__name__)
CORS(app)  # Allow React Native to connect

detector = None


def load_model():
    """Load the trained sound detection model."""
    global detector
    try:
        from inference import SoundDetector

        model_path = MODEL_DIR / "best_model.keras"
        metadata_path = DATA_DIR / "metadata.json"
        label_mapping_path = DATA_DIR / "label_mapping.json"

        if not model_path.exists():
            log.warning(f"Model not found at {model_path}. Run training first.")
            return False

        detector = SoundDetector(
            model_path=str(model_path),
            metadata_path=str(metadata_path),
            label_mapping_path=str(label_mapping_path),
        )
        log.info("✅ Sound detection model loaded successfully")
        log.info(f"   Classes: {', '.join(detector.class_names)}")
        return True

    except Exception as e:
        log.error(f"❌ Failed to load model: {e}")
        return False


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": detector is not None,
        "classes": detector.class_names if detector else [],
    })


@app.route("/predict-sound", methods=["POST"])
def predict_sound():
    """
    Predict sound class from base64-encoded audio.

    Request body:
        {
            "audio": "<base64 encoded audio bytes>",
            "sample_rate": 44100   (optional, from recording device)
        }

    Response:
        {
            "predicted_class": "car horns",
            "confidence": 0.94,
            "all_probabilities": { "car horns": 0.94, "bus horns": 0.02, ... },
            "success": true
        }
    """
    if detector is None:
        return jsonify({"error": "Model not loaded", "success": False}), 503

    data = request.get_json(force=True) or {}
    audio_b64 = data.get("audio")

    if not audio_b64:
        return jsonify({"error": "No audio provided", "success": False}), 400

    try:
        # Decode base64 audio bytes
        audio_bytes = base64.b64decode(audio_b64)

        # Write to a temp file (librosa can handle m4a, wav, mp3, etc.)
        suffix = ".m4a"  # Expo records m4a by default
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # Run prediction
        predicted_class, confidence, all_probs = detector.predict(tmp_path)

        # Clean up temp file
        os.unlink(tmp_path)

        # Build probabilities dict
        prob_dict = {
            detector.label_decoder[i]: float(all_probs[i])
            for i in range(len(all_probs))
        }

        log.info(f"Prediction: {predicted_class} ({confidence * 100:.1f}%)")

        return jsonify({
            "success": True,
            "predicted_class": predicted_class,
            "confidence": float(confidence),
            "all_probabilities": prob_dict,
        })

    except Exception as e:
        log.error(f"Prediction error: {e}")
        # Clean up on error
        try:
            os.unlink(tmp_path)
        except Exception:
            pass
        return jsonify({"error": str(e), "success": False}), 500


if __name__ == "__main__":
    log.info("=" * 60)
    log.info("  Sound Alert API Server")
    log.info("=" * 60)

    if load_model():
        log.info("Starting API server on port 5001...")
        log.info("React Native should connect to: http://<YOUR-IP>:5001")
        log.info("Find your IP: run 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)")
        app.run(host="0.0.0.0", port=5001, debug=False)
    else:
        log.error("Cannot start server without a trained model.")
        log.error("Train the model first:")
        log.error("  python src/train_model.py --data_dir data/processed/vehicle_horns --model_dir models/vehicle_horns_cnn")
        sys.exit(1)
