from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager
import os

# Flask uygulamasını oluştur
app = Flask(__name__)
CORS(app)

# Veritabanı yapılandırması
app.config['SECRET_KEY'] = 'gizli-anahtar-buraya'  # Güvenlik için değiştirin
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'envanter.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Veritabanı nesnesini oluştur
db = SQLAlchemy(app)

# Login yöneticisini oluştur
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

# Blueprint'leri kaydet
from app.routes import main
app.register_blueprint(main)

# Veritabanı tablolarını oluştur
with app.app_context():
    db.create_all() 