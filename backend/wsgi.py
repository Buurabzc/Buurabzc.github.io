import os
import sys

# Uygulama dizinini path'e ekle
path = os.path.expanduser('~/envanter')
if path not in sys.path:
    sys.path.append(path)

# .env dosyasını yükle
from dotenv import load_dotenv
project_folder = os.path.expanduser('~/envanter/backend')
load_dotenv(os.path.join(project_folder, '.env'))

# Uygulamayı içe aktar
from app import app as application 