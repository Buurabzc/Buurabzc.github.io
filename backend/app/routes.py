from flask import Blueprint, request, jsonify
from app import db
from app.models import Depo, Emanet, Kullanici
from flask_login import login_required, current_user
import bcrypt

main = Blueprint('main', __name__)

# Depo işlemleri
@main.route('/api/depo', methods=['GET'])
@login_required
def get_depolar():
    depolar = Depo.query.all()
    return jsonify([{
        'id': d.id,
        'depo_adi': d.depo_adi
    } for d in depolar])

@main.route('/api/depo/<int:depo_id>/emanetler', methods=['GET'])
@login_required
def get_depo_emanetler(depo_id):
    emanetler = Emanet.query.filter_by(depo_id=depo_id).all()
    return jsonify([e.to_dict() for e in emanetler])

# Emanet işlemleri
@main.route('/api/emanet', methods=['POST'])
@login_required
def add_emanet():
    data = request.json
    try:
        yeni_emanet = Emanet(
            depo_id=data['depo_id'],
            sira_no=data['sira_no'],
            emanet_no=data['emanet_no'],
            dolap_no=data['dolap_no'],
            raf_no=data['raf_no'],
            notlar=data.get('notlar', '')
        )
        db.session.add(yeni_emanet)
        db.session.commit()
        return jsonify({'message': 'Emanet başarıyla eklendi', 'emanet': yeni_emanet.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@main.route('/api/emanet/<int:emanet_id>', methods=['PUT'])
@login_required
def update_emanet(emanet_id):
    emanet = Emanet.query.get_or_404(emanet_id)
    data = request.json
    try:
        emanet.sira_no = data.get('sira_no', emanet.sira_no)
        emanet.emanet_no = data.get('emanet_no', emanet.emanet_no)
        emanet.dolap_no = data.get('dolap_no', emanet.dolap_no)
        emanet.raf_no = data.get('raf_no', emanet.raf_no)
        emanet.notlar = data.get('notlar', emanet.notlar)
        db.session.commit()
        return jsonify({'message': 'Emanet başarıyla güncellendi', 'emanet': emanet.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@main.route('/api/emanet/<int:emanet_id>', methods=['DELETE'])
@login_required
def delete_emanet(emanet_id):
    emanet = Emanet.query.get_or_404(emanet_id)
    try:
        db.session.delete(emanet)
        db.session.commit()
        return jsonify({'message': 'Emanet başarıyla silindi'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# Arama işlemi
@main.route('/api/search', methods=['GET'])
@login_required
def search_emanetler():
    query = request.args.get('q', '')
    depo_id = request.args.get('depo_id')
    
    base_query = Emanet.query
    
    if depo_id:
        base_query = base_query.filter_by(depo_id=depo_id)
    
    emanetler = base_query.filter(
        db.or_(
            Emanet.sira_no.ilike(f'%{query}%'),
            Emanet.emanet_no.ilike(f'%{query}%'),
            Emanet.dolap_no.ilike(f'%{query}%'),
            Emanet.raf_no.ilike(f'%{query}%'),
            Emanet.notlar.ilike(f'%{query}%')
        )
    ).all()
    
    return jsonify([e.to_dict() for e in emanetler]) 