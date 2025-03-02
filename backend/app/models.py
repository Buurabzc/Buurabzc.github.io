from app import db
from flask_login import UserMixin
from datetime import datetime

class Kullanici(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kullanici_adi = db.Column(db.String(80), unique=True, nullable=False)
    sifre_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Depo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    depo_adi = db.Column(db.String(50), nullable=False, unique=True)
    emanetler = db.relationship('Emanet', backref='depo', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Emanet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    depo_id = db.Column(db.Integer, db.ForeignKey('depo.id'), nullable=False)
    sira_no = db.Column(db.String(20), nullable=False)
    emanet_no = db.Column(db.String(20), nullable=False)
    dolap_no = db.Column(db.String(20), nullable=False)
    raf_no = db.Column(db.String(20), nullable=False)
    notlar = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'depo_id': self.depo_id,
            'sira_no': self.sira_no,
            'emanet_no': self.emanet_no,
            'dolap_no': self.dolap_no,
            'raf_no': self.raf_no,
            'notlar': self.notlar,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        } 