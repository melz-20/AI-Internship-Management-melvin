"""Flask application initialization."""

from flask import Flask
from flask_cors import CORS

from config import Config
from routes import api


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["REPORTS_DIR"].mkdir(parents=True, exist_ok=True)

    CORS(app, resources={r"/*": {"origins": "*"}})
    app.register_blueprint(api)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
