from app import db, app
from app.models import Depo, Kullanici
import bcrypt

def init_db():
    with app.app_context():
        # Veritabanını oluştur
        db.create_all()

        # Varsayılan depoları ekle
        default_depolar = ['depo1', 'depo2', 'feto', 'eskiFeto', 'buro']
        
        for depo_adi in default_depolar:
            if not Depo.query.filter_by(depo_adi=depo_adi).first():
                depo = Depo(depo_adi=depo_adi)
                db.session.add(depo)

        # Varsayılan admin kullanıcısını ekle
        if not Kullanici.query.filter_by(kullanici_adi='admin').first():
            sifre = 'admin'
            sifre_hash = bcrypt.hashpw(sifre.encode('utf-8'), bcrypt.gensalt())
            admin = Kullanici(
                kullanici_adi='admin',
                sifre_hash=sifre_hash.decode('utf-8')
            )
            db.session.add(admin)

        # Değişiklikleri kaydet
        db.session.commit()

if __name__ == '__main__':
    init_db()
    print("Veritabanı başarıyla oluşturuldu ve varsayılan veriler eklendi.") 